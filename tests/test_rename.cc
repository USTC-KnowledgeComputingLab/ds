#include <ds/term.hh>
#include <ds/utility.hh>
#include <gtest/gtest.h>

class TestRename : public ::testing::Test {
  protected:
    const ds::length_t buffer_size = 200;

    TestRename() { }
    ~TestRename() override { }
    void SetUp() override {
        result_t = reinterpret_cast<ds::term_t*>(operator new(buffer_size));
        result_r = reinterpret_cast<ds::rule_t*>(operator new(buffer_size));
    }
    void TearDown() override {
        operator delete(result_t);
        operator delete(result_r);
    }

    ds::term_t* result_t;
    ds::rule_t* result_r;

    void rename_term_check(const char* term_text, const char* prefix_suffix_text, const char* expect_text) {
        auto term = ds::text_to_term(term_text, buffer_size);
        auto prefix_suffix = ds::text_to_term(prefix_suffix_text, buffer_size);
        EXPECT_NE(result_t->rename(term.get(), prefix_suffix.get(), nullptr), nullptr);
        auto result = ds::term_to_text(result_t, buffer_size);
        EXPECT_STREQ(result.get(), expect_text);
        auto correct_length = result_t->data_size();
        EXPECT_NE(result_t->rename(term.get(), prefix_suffix.get(), reinterpret_cast<std::byte*>(result_t) + correct_length), nullptr);
        for (auto i = 0; i < correct_length; ++i) {
            EXPECT_EQ(result_t->rename(term.get(), prefix_suffix.get(), reinterpret_cast<std::byte*>(result_t) + i), nullptr);
        }
    }

    void rename_rule_check(const char* rule_text, const char* prefix_suffix_text, const char* expect_text) {
        auto rule = ds::text_to_rule(rule_text, buffer_size);
        auto prefix_suffix = ds::text_to_rule(prefix_suffix_text, buffer_size);
        EXPECT_NE(result_r->rename(rule.get(), prefix_suffix.get(), nullptr), nullptr);
        auto result = ds::rule_to_text(result_r, buffer_size);
        EXPECT_STREQ(result.get(), expect_text);
        auto correct_length = result_r->data_size();
        EXPECT_NE(result_r->rename(rule.get(), prefix_suffix.get(), reinterpret_cast<std::byte*>(result_r) + correct_length), nullptr);
        for (auto i = 0; i < correct_length; ++i) {
            EXPECT_EQ(result_r->rename(rule.get(), prefix_suffix.get(), reinterpret_cast<std::byte*>(result_r) + i), nullptr);
        }
    }
};

TEST_F(TestRename, rename_term_variable) {
    // Test basic variable renaming
    rename_term_check("`x", "(pre_ _suf)", "`pre_x_suf");
    rename_term_check("`abc", "(a_ _z)", "`a_abc_z");
    // Test with empty prefix/suffix (using _ as empty string representation in item)
    rename_term_check("`x", "(_ _)", "`_x_");
    rename_term_check("`var", "(prefix _)", "`prefixvar_");
    rename_term_check("`var", "(_ suffix)", "`_varsuffix");
}

TEST_F(TestRename, rename_term_item) {
    // Items should not be renamed
    rename_term_check("item", "(pre_ _suf)", "item");
    rename_term_check("abc", "(a_ _z)", "abc");
}

TEST_F(TestRename, rename_term_list) {
    // List with variables should have all variables renamed
    rename_term_check("(`x `y)", "(p_ _s)", "(`p_x_s `p_y_s)");
    rename_term_check("(a `x b `y)", "(pre_ _suf)", "(a `pre_x_suf b `pre_y_suf)");
    // Nested lists
    rename_term_check("((`x))", "(p_ _s)", "((`p_x_s))");
    rename_term_check("((`x `y) `z)", "(a_ _b)", "((`a_x_b `a_y_b) `a_z_b)");
}

TEST_F(TestRename, rename_term_mixed) {
    // Mixed term with item and variable
    rename_term_check("(item `var)", "(pre _suf)", "(item `prevar_suf)");
    rename_term_check("(f `a `b c)", "(x y)", "(f `xay `xby c)");
}

TEST_F(TestRename, rename_term_invalid) {
    // Invalid prefix_and_suffix (not a list)
    auto term = ds::text_to_term("`x", buffer_size);
    auto invalid_ps = ds::text_to_term("item", buffer_size);
    EXPECT_EQ(result_t->rename(term.get(), invalid_ps.get(), nullptr), nullptr);

    // Invalid prefix_and_suffix (list size != 2)
    auto invalid_ps_size = ds::text_to_term("(a)", buffer_size);
    EXPECT_EQ(result_t->rename(term.get(), invalid_ps_size.get(), nullptr), nullptr);

    auto invalid_ps_size3 = ds::text_to_term("(a b c)", buffer_size);
    EXPECT_EQ(result_t->rename(term.get(), invalid_ps_size3.get(), nullptr), nullptr);

    // Invalid prefix_and_suffix (elements are not items)
    auto invalid_ps_elem = ds::text_to_term("(`a b)", buffer_size);
    EXPECT_EQ(result_t->rename(term.get(), invalid_ps_elem.get(), nullptr), nullptr);

    // Null term
    ds::term_t* null_term = reinterpret_cast<ds::term_t*>(operator new(buffer_size));
    null_term->set_null(nullptr);
    auto valid_ps = ds::text_to_term("(a b)", buffer_size);
    EXPECT_EQ(result_t->rename(null_term, valid_ps.get(), nullptr), nullptr);
    operator delete(null_term);
}

TEST_F(TestRename, rename_rule_basic) {
    rename_rule_check("`x", "(pre_ _suf)", "----\n`pre_x_suf\n");
    rename_rule_check("item", "(pre_ _suf)", "----\nitem\n");
    rename_rule_check("(`x `y)", "(a b)", "----\n(`axb `ayb)\n");
}

TEST_F(TestRename, rename_rule_with_premises) {
    rename_rule_check(
        "`p\n"
        "`q\n"
        "----------\n"
        "`r\n",
        "(pre_ _suf)",
        "`pre_p_suf\n"
        "`pre_q_suf\n"
        "----------\n"
        "`pre_r_suf\n"
    );

    rename_rule_check(
        "(`p -> `q)\n"
        "`p\n"
        "----------\n"
        "`q\n",
        "(x y)",
        "(`xpy -> `xqy)\n"
        "`xpy\n"
        "--------------\n"
        "`xqy\n"
    );
}
