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
        chain_buffer = std::unique_ptr<rule_t>(reinterpret_cast<rule_t*>(operator new(buffer_size)));
        done_cycle = 0;
    }

    void chain_t::reset() {
        done_cycle = 0;
        current_cycle = 0;
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
            }
            return true;
        } else {
            return false;
        }
    }

    length_t chain_t::execute(const std::function<bool(rule_t*)>& callback) {
        std::set<std::unique_ptr<rule_t>, less_t> temp_rules;
        std::set<std::unique_ptr<rule_t>, less_t> temp_facts;

        bool break_all = false;
        for (auto& [rule, rules_cycle] : rules) {
            length_t premises_count = rule->premises_count();

            // 收集所有可能匹配第一个 premise 的 facts，生成初始的 partial rules
            std::vector<std::unique_ptr<rule_t>> current_chains;

            for (auto& [fact, facts_cycle] : facts) {
                if (rules_cycle <= done_cycle && facts_cycle <= done_cycle) {
                    continue;
                }
                buffer->match(rule.get(), fact.get(), reinterpret_cast<std::byte*>(buffer.get()) + buffer_size);
                if (!buffer->valid()) {
                    continue;
                }
                if (buffer->data_size() > limit_size) {
                    continue;
                }
                // 复制中间结果
                auto new_rule = std::unique_ptr<rule_t>(reinterpret_cast<rule_t*>(operator new(buffer->data_size())));
                memcpy(new_rule.get(), buffer.get(), buffer->data_size());
                current_chains.emplace_back(std::move(new_rule));
            }

            // 链式匹配剩余的 premises (从第 2 个开始)
            for (length_t premise_index = 1; premise_index < premises_count; ++premise_index) {
                if (current_chains.empty()) {
                    break;
                }

                std::vector<std::unique_ptr<rule_t>> next_chains;

                // 为每个 partial rule 匹配下一个 premise
                for (auto& partial_chain : current_chains) {
                    // 此时 partial_chain 的第一个 premise 是待匹配的下一个 premise
                    for (auto& [fact, facts_cycle] : facts) {
                        chain_buffer->match(partial_chain.get(), fact.get(), reinterpret_cast<std::byte*>(chain_buffer.get()) + buffer_size);
                        if (!chain_buffer->valid()) {
                            continue;
                        }
                        if (chain_buffer->data_size() > limit_size) {
                            continue;
                        }
                        // 复制新的中间结果
                        auto new_rule = std::unique_ptr<rule_t>(reinterpret_cast<rule_t*>(operator new(chain_buffer->data_size())));
                        memcpy(new_rule.get(), chain_buffer.get(), chain_buffer->data_size());
                        next_chains.emplace_back(std::move(new_rule));
                    }
                }

                current_chains = std::move(next_chains);
            }

            // 处理最终的 chain 结果
            for (auto& result : current_chains) {
                if (result->premises_count() != 0) {
                    // rule - 还有未匹配的 premises
                    if (rules.find(result) != rules.end() || temp_rules.find(result) != temp_rules.end()) {
                        continue;
                    }
                    auto new_rule = std::unique_ptr<rule_t>(reinterpret_cast<rule_t*>(operator new(result->data_size())));
                    memcpy(new_rule.get(), result.get(), result->data_size());
                    temp_rules.emplace(std::move(new_rule));
                } else {
                    // fact - 所有 premises 已匹配完毕
                    if (facts.find(result) != facts.end() || temp_facts.find(result) != temp_facts.end()) {
                        continue;
                    }
                    auto new_fact = std::unique_ptr<rule_t>(reinterpret_cast<rule_t*>(operator new(result->data_size())));
                    memcpy(new_fact.get(), result.get(), result->data_size());
                    temp_facts.emplace(std::move(new_fact));
                }
                if (callback(result.get())) {
                    break_all = true;
                    break;
                }
            }

            if (break_all) {
                break;
            }
        }

        if (!break_all) {
            done_cycle = current_cycle;
        }
        ++current_cycle;
        length_t count = temp_rules.size() + temp_facts.size();
        for (auto it = temp_rules.begin(); it != temp_rules.end();) {
            auto node = temp_rules.extract(it++);
            rules.emplace(std::move(node.value()), current_cycle);
        }
        for (auto it = temp_facts.begin(); it != temp_facts.end();) {
            auto node = temp_facts.extract(it++);
            facts.emplace(std::move(node.value()), current_cycle);
        }
        return count;
    }
} // namespace ds
