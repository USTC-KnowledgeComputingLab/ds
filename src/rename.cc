#include <cstring>

#include <ds/helper.hh>
#include <ds/item.hh>
#include <ds/list.hh>
#include <ds/rule.hh>
#include <ds/term.hh>
#include <ds/variable.hh>

namespace ds {
    term_t* term_t::rename(term_t* term, term_t* prefix_and_suffix, std::byte* check_tail) {
        list_t* ps_list = prefix_and_suffix->list();
        if (ps_list == nullptr || ps_list->get_list_size() != 2) [[unlikely]] {
            return nullptr;
        }
        // prefix_and_suffix is ((prefix) (suffix)), each element is a list of 0 or 1 items
        list_t* prefix_list = ps_list->term(0)->list();
        list_t* suffix_list = ps_list->term(1)->list();
        if (prefix_list == nullptr || suffix_list == nullptr) [[unlikely]] {
            return nullptr;
        }
        // Get prefix string (empty if list is empty)
        char* prefix_str = nullptr;
        length_t prefix_len = 0;
        if (prefix_list->get_list_size() == 1) {
            item_t* prefix_item = prefix_list->term(0)->item();
            if (prefix_item == nullptr) [[unlikely]] {
                return nullptr;
            }
            prefix_str = prefix_item->name()->get_string();
            prefix_len = strlen(prefix_str);
        } else if (prefix_list->get_list_size() != 0) [[unlikely]] {
            return nullptr;
        }
        // Get suffix string (empty if list is empty)
        char* suffix_str = nullptr;
        length_t suffix_len = 0;
        if (suffix_list->get_list_size() == 1) {
            item_t* suffix_item = suffix_list->term(0)->item();
            if (suffix_item == nullptr) [[unlikely]] {
                return nullptr;
            }
            suffix_str = suffix_item->name()->get_string();
            suffix_len = strlen(suffix_str);
        } else if (suffix_list->get_list_size() != 0) [[unlikely]] {
            return nullptr;
        }

        switch (term->get_type()) {
        case term_type_t::variable: {
            char* name_str = term->variable()->name()->get_string();
            length_t name_len = strlen(name_str);
            length_t new_len = prefix_len + name_len + suffix_len + 1;
            if (set_variable(check_tail) == nullptr) [[unlikely]] {
                return nullptr;
            }
            if (variable()->name()->set_length(new_len, check_tail) == nullptr) [[unlikely]] {
                return nullptr;
            }
            char* dst = variable()->name()->get_string();
            if (prefix_len > 0) {
                memcpy(dst, prefix_str, prefix_len);
            }
            memcpy(dst + prefix_len, name_str, name_len);
            if (suffix_len > 0) {
                memcpy(dst + prefix_len + name_len, suffix_str, suffix_len);
            }
            dst[new_len - 1] = '\0';
            return this;
        }
        case term_type_t::item: {
            if (check_before_fail(check_tail, this, term->data_size())) [[unlikely]] {
                return nullptr;
            }
            memcpy(this, term, term->data_size());
            return this;
        }
        case term_type_t::list: {
            list_t* src = term->list();
            if (set_list(check_tail) == nullptr) [[unlikely]] {
                return nullptr;
            }
            list_t* dst = list();
            if (dst->set_list_size(src->get_list_size(), check_tail) == nullptr) [[unlikely]] {
                return nullptr;
            }
            for (length_t index = 0; index < dst->get_list_size(); ++index) {
                if (dst->term(index)->rename(src->term(index), prefix_and_suffix, check_tail) == nullptr) [[unlikely]] {
                    return nullptr;
                }
                dst->update_term_size(index);
            }
            return this;
        }
        default:
            return nullptr;
        }
    }

    rule_t* rule_t::rename(rule_t* rule, rule_t* prefix_and_suffix, std::byte* check_tail) {
        term_t* ps_term = prefix_and_suffix->only_conclusion();
        if (ps_term == nullptr) [[unlikely]] {
            return nullptr;
        }
        list_t* dst = this;
        list_t* src = rule;
        if (dst->set_list_size(src->get_list_size(), check_tail) == nullptr) [[unlikely]] {
            return nullptr;
        }
        for (length_t index = 0; index < dst->get_list_size(); ++index) {
            if (dst->term(index)->rename(src->term(index), ps_term, check_tail) == nullptr) [[unlikely]] {
                return nullptr;
            }
            dst->update_term_size(index);
        }
        return this;
    }
} // namespace ds
