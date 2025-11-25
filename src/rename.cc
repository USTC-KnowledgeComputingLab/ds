#include <cstring>

#include <ds/helper.hh>
#include <ds/item.hh>
#include <ds/list.hh>
#include <ds/rule.hh>
#include <ds/term.hh>
#include <ds/variable.hh>

namespace ds {
    /// @brief 从prefix_and_suffix中提取prefix和suffix字符串。
    /// @param prefix_and_suffix 格式为((prefix) (suffix))的term，每个内部list包含0或1个item。
    /// @param prefix_str 输出参数，prefix字符串指针，如果prefix为空则为nullptr。
    /// @param prefix_len 输出参数，prefix字符串长度。
    /// @param suffix_str 输出参数，suffix字符串指针，如果suffix为空则为nullptr。
    /// @param suffix_len 输出参数，suffix字符串长度。
    /// @return 成功返回true，格式错误返回false。
    static bool extract_prefix_suffix(
        term_t* prefix_and_suffix,
        char*& prefix_str,
        length_t& prefix_len,
        char*& suffix_str,
        length_t& suffix_len
    ) {
        list_t* ps_list = prefix_and_suffix->list();
        if (ps_list == nullptr || ps_list->get_list_size() != 2) [[unlikely]] {
            return false;
        }
        // prefix_and_suffix格式为((prefix) (suffix))，每个元素是包含0或1个item的list
        list_t* prefix_list = ps_list->term(0)->list();
        list_t* suffix_list = ps_list->term(1)->list();
        if (prefix_list == nullptr || suffix_list == nullptr) [[unlikely]] {
            return false;
        }
        // 获取prefix字符串（如果list为空则为nullptr）
        prefix_str = nullptr;
        prefix_len = 0;
        if (prefix_list->get_list_size() == 1) {
            item_t* prefix_item = prefix_list->term(0)->item();
            if (prefix_item == nullptr) [[unlikely]] {
                return false;
            }
            prefix_str = prefix_item->name()->get_string();
            prefix_len = strlen(prefix_str);
        } else if (prefix_list->get_list_size() != 0) [[unlikely]] {
            return false;
        }
        // 获取suffix字符串（如果list为空则为nullptr）
        suffix_str = nullptr;
        suffix_len = 0;
        if (suffix_list->get_list_size() == 1) {
            item_t* suffix_item = suffix_list->term(0)->item();
            if (suffix_item == nullptr) [[unlikely]] {
                return false;
            }
            suffix_str = suffix_item->name()->get_string();
            suffix_len = strlen(suffix_str);
        } else if (suffix_list->get_list_size() != 0) [[unlikely]] {
            return false;
        }
        return true;
    }

    /// @brief 内部递归函数，使用已提取的prefix和suffix字符串对term进行重命名。
    /// @param result 存放结果的term指针。
    /// @param term 待被重命名的term。
    /// @param prefix_str prefix字符串指针，可以为nullptr。
    /// @param prefix_len prefix字符串长度。
    /// @param suffix_str suffix字符串指针，可以为nullptr。
    /// @param suffix_len suffix字符串长度。
    /// @param check_tail 可选的尾指针检查。
    /// @return 成功返回result，失败返回nullptr。
    static term_t* rename_with_strings(
        term_t* result,
        term_t* term,
        char* prefix_str,
        length_t prefix_len,
        char* suffix_str,
        length_t suffix_len,
        std::byte* check_tail
    ) {
        switch (term->get_type()) {
        case term_type_t::variable: {
            char* name_str = term->variable()->name()->get_string();
            length_t name_len = strlen(name_str);
            length_t new_len = prefix_len + name_len + suffix_len + 1;
            if (result->set_variable(check_tail) == nullptr) [[unlikely]] {
                return nullptr;
            }
            if (result->variable()->name()->set_length(new_len, check_tail) == nullptr) [[unlikely]] {
                return nullptr;
            }
            char* dst = result->variable()->name()->get_string();
            if (prefix_len > 0) {
                memcpy(dst, prefix_str, prefix_len);
            }
            memcpy(dst + prefix_len, name_str, name_len);
            if (suffix_len > 0) {
                memcpy(dst + prefix_len + name_len, suffix_str, suffix_len);
            }
            dst[new_len - 1] = '\0';
            return result;
        }
        case term_type_t::item: {
            if (check_before_fail(check_tail, result, term->data_size())) [[unlikely]] {
                return nullptr;
            }
            memcpy(result, term, term->data_size());
            return result;
        }
        case term_type_t::list: {
            list_t* src = term->list();
            if (result->set_list(check_tail) == nullptr) [[unlikely]] {
                return nullptr;
            }
            list_t* dst = result->list();
            if (dst->set_list_size(src->get_list_size(), check_tail) == nullptr) [[unlikely]] {
                return nullptr;
            }
            for (length_t index = 0; index < dst->get_list_size(); ++index) {
                if (rename_with_strings(dst->term(index), src->term(index), prefix_str, prefix_len, suffix_str, suffix_len, check_tail) == nullptr) [[unlikely]] {
                    return nullptr;
                }
                dst->update_term_size(index);
            }
            return result;
        }
        default:
            return nullptr;
        }
    }

    term_t* term_t::rename(term_t* term, term_t* prefix_and_suffix, std::byte* check_tail) {
        // 在开头提取prefix和suffix字符串，避免每次递归时重复解析
        char* prefix_str;
        length_t prefix_len;
        char* suffix_str;
        length_t suffix_len;
        if (!extract_prefix_suffix(prefix_and_suffix, prefix_str, prefix_len, suffix_str, suffix_len)) [[unlikely]] {
            return nullptr;
        }
        return rename_with_strings(this, term, prefix_str, prefix_len, suffix_str, suffix_len, check_tail);
    }

    rule_t* rule_t::rename(rule_t* rule, rule_t* prefix_and_suffix, std::byte* check_tail) {
        term_t* ps_term = prefix_and_suffix->only_conclusion();
        if (ps_term == nullptr) [[unlikely]] {
            return nullptr;
        }
        // 在开头提取prefix和suffix字符串，避免每次递归时重复解析
        char* prefix_str;
        length_t prefix_len;
        char* suffix_str;
        length_t suffix_len;
        if (!extract_prefix_suffix(ps_term, prefix_str, prefix_len, suffix_str, suffix_len)) [[unlikely]] {
            return nullptr;
        }
        list_t* dst = this;
        list_t* src = rule;
        if (dst->set_list_size(src->get_list_size(), check_tail) == nullptr) [[unlikely]] {
            return nullptr;
        }
        for (length_t index = 0; index < dst->get_list_size(); ++index) {
            if (rename_with_strings(dst->term(index), src->term(index), prefix_str, prefix_len, suffix_str, suffix_len, check_tail) == nullptr) [[unlikely]] {
                return nullptr;
            }
            dst->update_term_size(index);
        }
        return this;
    }
} // namespace ds
