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
        max_depth = 1;
        done_cycle = 0;
        last_fact_cycle = 0;
    }

    void chain_t::set_buffer_size(length_t _buffer_size) {
        buffer_size = _buffer_size;
        buffers.clear();
        buffers.resize(max_depth);
        for (auto& buf : buffers) {
            buf = std::unique_ptr<rule_t>(reinterpret_cast<rule_t*>(operator new(buffer_size)));
        }
        done_cycle = 0;
        last_fact_cycle = 0;
    }

    void chain_t::set_max_depth(length_t _max_depth) {
        max_depth = _max_depth;
        // 移除 premises 数目超过新 max_depth 的 rules
        for (auto it = rules.begin(); it != rules.end();) {
            if (it->first->premises_count() > max_depth) {
                it = rules.erase(it);
            } else {
                ++it;
            }
        }
        // 重新分配 buffers
        buffers.clear();
        buffers.resize(max_depth);
        for (auto& buf : buffers) {
            buf = std::unique_ptr<rule_t>(reinterpret_cast<rule_t*>(operator new(buffer_size)));
        }
    }

    void chain_t::reset() {
        done_cycle = 0;
        current_cycle = 0;
        last_fact_cycle = 0;
        max_depth = 1;
        rules.clear();
        facts.clear();
        buffers.clear();
        buffers.resize(max_depth);
        for (auto& buf : buffers) {
            buf = std::unique_ptr<rule_t>(reinterpret_cast<rule_t*>(operator new(buffer_size)));
        }
    }

    bool chain_t::add(std::string_view text) {
        auto candidate = text_to_rule(text.data(), limit_size);
        if (candidate) {
            if (done_cycle == current_cycle) {
                ++current_cycle;
            }
            if (candidate->premises_count() != 0) {
                // rule: 检查 premises 数目是否超过 max_depth
                if (candidate->premises_count() > max_depth) {
                    return false;
                }
                rules.emplace(std::move(candidate), current_cycle);
            } else {
                // fact
                facts.emplace(std::move(candidate), current_cycle);
                last_fact_cycle = current_cycle;
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

        // 递归匹配函数
        // current_rule: 当前要匹配的 rule（随着匹配进行，已匹配的 premise 会被消耗）
        // depth: 当前递归深度（即将匹配第 depth 个 premise，从 0 开始）
        // match_recursive 会遍历所有 facts 尝试匹配 current_rule 的第一个 premise
        // 匹配成功后递归处理剩余 premises
        std::function<void(rule_t*, length_t)> match_recursive;
        match_recursive = [&](rule_t* current_rule, length_t depth) -> void {
            // 检查是否所有 premises 已匹配完成
            if (current_rule->premises_count() == 0) {
                // 所有 premises 已匹配完成，current_rule 是一个 fact
                // 这种情况应该在上一层匹配成功后处理，而不是在这里
                return;
            }

            // 使用 buffers[depth] 作为当前深度的匹配缓冲区
            rule_t* match_buffer = buffers[depth].get();

            // 遍历所有 facts 匹配当前 rule 的第一个 premise
            for (auto& [fact, facts_cycle] : facts) {
                if (break_all) {
                    return;
                }

                match_buffer->match(current_rule, fact.get(), reinterpret_cast<std::byte*>(match_buffer) + buffer_size);
                if (!match_buffer->valid()) {
                    continue;
                }
                if (match_buffer->data_size() > limit_size) {
                    continue;
                }

                // 复制中间结果
                auto next_rule = std::unique_ptr<rule_t>(reinterpret_cast<rule_t*>(operator new(match_buffer->data_size())));
                memcpy(next_rule.get(), match_buffer.get(), match_buffer->data_size());

                // 如果 next_rule 没有 premises 了，说明匹配完成，直接处理结果
                if (next_rule->premises_count() == 0) {
                    // 是 fact
                    if (facts.find(next_rule) == facts.end() && temp_facts.find(next_rule) == temp_facts.end()) {
                        auto copied = std::unique_ptr<rule_t>(reinterpret_cast<rule_t*>(operator new(next_rule->data_size())));
                        memcpy(copied.get(), next_rule.get(), next_rule->data_size());
                        temp_facts.emplace(std::move(copied));
                    }
                    if (callback(next_rule.get())) {
                        break_all = true;
                        return;
                    }
                } else {
                    // 还有 premises，检查是否可以继续递归
                    if (depth + 1 < max_depth) {
                        // 可以继续递归匹配下一个 premise
                        match_recursive(next_rule.get(), depth + 1);
                    } else {
                        // 达到最大深度，将中间结果作为未完成的 rule 保存
                        if (rules.find(next_rule) == rules.end() && temp_rules.find(next_rule) == temp_rules.end()) {
                            auto copied = std::unique_ptr<rule_t>(reinterpret_cast<rule_t*>(operator new(next_rule->data_size())));
                            memcpy(copied.get(), next_rule.get(), next_rule->data_size());
                            temp_rules.emplace(std::move(copied));
                        }
                        if (callback(next_rule.get())) {
                            break_all = true;
                            return;
                        }
                    }
                }
            }
        };

        // 外层循环：遍历所有 rules
        for (auto& [rule, rules_cycle] : rules) {
            if (break_all) {
                break;
            }

            // 只有当 rule 是新的或者 facts 有更新时才处理
            if (rules_cycle <= done_cycle && last_fact_cycle <= done_cycle) {
                continue;
            }

            // 从第一个 premise 开始递归匹配（depth = 0）
            match_recursive(rule.get(), 0);
        }

        // 更新 cycle
        if (!break_all) {
            done_cycle = current_cycle;
        }
        ++current_cycle;
        // 注意：last_fact_cycle 只在有新 fact 加入时更新（在 add 函数中）
        // 这里不更新 last_fact_cycle，因为 fact 库本身没有变化

        // 将新发现的 rules 和 facts 加入库中
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
