#include <cstring>
#include <set>

#include <ds/chain.hh>
#include <ds/utility.hh>

namespace ds {
    bool chain_t::less_t::operator()(const std::unique_ptr<rule_t>& lhs, const std::unique_ptr<rule_t>& rhs) const {
        const length_t lhs_size = lhs->data_size();
        const length_t rhs_size = rhs->data_size();
        if (lhs_size < rhs_size) {
            return true;
        }
        if (lhs_size > rhs_size) {
            return false;
        }
        if (std::memcmp(lhs->head(), rhs->head(), lhs_size) < 0) {
            return true;
        }
        return false;
    }

    chain_t::chain_t(length_t _limit_size, length_t _buffer_size) {
        set_limit_size(_limit_size);
        set_buffer_size(_buffer_size);
        reset();
    }

    void chain_t::set_limit_size(length_t _limit_size) {
        limit_size = _limit_size;
        done_cycle = 0;
    }

    void chain_t::set_buffer_size(length_t _buffer_size) {
        buffer_size = _buffer_size;
        buffer = std::unique_ptr<rule_t>(reinterpret_cast<rule_t*>(operator new(buffer_size)));
        done_cycle = 0;
    }

    void chain_t::reset() {
        done_cycle = 0;
        current_cycle = 0;
        last_fact_cycle = 0;
        rules.clear();
        facts.clear();
    }

    bool chain_t::add(std::string_view text) {
        auto candidate = text_to_rule(text.data(), limit_size);
        if (candidate) {
            if (done_cycle == current_cycle) {
                ++current_cycle;
            }
            if (candidate->premises_count() != 0) {
                rules.emplace(std::move(candidate), current_cycle);
            } else {
                facts.emplace(std::move(candidate), current_cycle);
                last_fact_cycle = current_cycle;
            }
            return true;
        } else {
            return false;
        }
    }

    length_t chain_t::execute(const std::function<bool(rule_t*)>& callback) {
        std::set<std::unique_ptr<rule_t>, less_t> temp_facts;
        std::set<std::unique_ptr<rule_t>, less_t> temp_rules;

        bool break_all = false;

        std::function<void(rule_t*, rule_t*, std::byte*)> chain_recursive;
        chain_recursive = [&](rule_t* rule, rule_t* workspace, std::byte* tail) -> void {
            if (rule->premises_count() == 0) {
                if (rule->data_size() > limit_size) {
                    return;
                }
                auto new_fact = std::unique_ptr<rule_t>(reinterpret_cast<rule_t*>(operator new(rule->data_size())));
                memcpy(new_fact->head(), rule->head(), rule->data_size());
                if (facts.find(new_fact) != facts.end() || temp_facts.find(new_fact) != temp_facts.end()) {
                    return;
                }
                temp_facts.emplace(std::move(new_fact));
                if (callback(rule)) {
                    break_all = true;
                }
                return;
            } else {
                do {
                    if (rule->data_size() > limit_size) {
                        break;
                    }
                    auto new_rule = std::unique_ptr<rule_t>(reinterpret_cast<rule_t*>(operator new(rule->data_size())));
                    memcpy(new_rule->head(), rule->head(), rule->data_size());
                    if (rules.find(new_rule) != rules.end() || temp_rules.find(new_rule) != temp_rules.end()) {
                        break;
                    }
                    temp_rules.emplace(std::move(new_rule));
                    if (callback(rule)) {
                        break_all = true;
                    }
                } while (false);
            }

            for (auto& [fact, facts_cycle] : facts) {
                workspace->match(rule, fact.get(), tail);
                if (!workspace->valid()) {
                    continue;
                }
                chain_recursive(workspace, reinterpret_cast<rule_t*>(workspace->tail()), tail);
            }
        };

        for (auto& [rule, rules_cycle] : rules) {
            if (rules_cycle <= done_cycle && last_fact_cycle <= done_cycle) {
                continue;
            }

            chain_recursive(rule.get(), buffer.get(), reinterpret_cast<std::byte*>(buffer.get()) + buffer_size);

            if (break_all) {
                break;
            }
        }

        if (!break_all) {
            done_cycle = current_cycle;
        }
        ++current_cycle;
        length_t count = temp_rules.size() + temp_facts.size();
        for (auto it = temp_facts.begin(); it != temp_facts.end();) {
            auto node = temp_facts.extract(it++);
            facts.emplace(std::move(node.value()), current_cycle);
        }
        return count;
    }
} // namespace ds
