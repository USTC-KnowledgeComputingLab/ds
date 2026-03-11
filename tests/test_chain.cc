#include <ds/chain.hh>
#include <ds/utility.hh>
#include <gtest/gtest.h>

class TestChain : public ::testing::Test {
  protected:
    const ds::length_t limit_size = 100;
    const ds::length_t buffer_size = 1000;

    TestChain() { }
    ~TestChain() override { }
    void SetUp() override {
        search = new ds::chain_t(limit_size, buffer_size);
    }
    void TearDown() override {
        delete search;
    }

    ds::chain_t* search;
};

TEST_F(TestChain, reset_parameters) {
    search->set_limit_size(50);
    search->set_buffer_size(500);
    search->reset();
}

TEST_F(TestChain, add_rule_and_fact) {
    EXPECT_TRUE(search->add("test rule"));
    EXPECT_TRUE(search->add("fact"));
}

TEST_F(TestChain, add_fail) {
    search->set_limit_size(10);
    EXPECT_FALSE(search->add("a-long-facts-that-exceeds-limit"));
}

TEST_F(TestChain, execute_single_premise) {
    search->add("p q");
    search->add("p");
    auto target = ds::text_to_rule("q", limit_size);
    bool success = false;
    auto count = search->execute([&success, &target](ds::rule_t* rule) {
        if (memcmp(rule, target.get(), rule->data_size()) == 0) {
            success = true;
            return true;
        }
        return false;
    });
    EXPECT_EQ(count, 1);
    EXPECT_TRUE(success);
}

TEST_F(TestChain, execute_multiple_premises_chain) {
    // p q r 表示：p, q |- r (两个 premises)
    // 在单轮中应该同时匹配 p 和 q，直接得到 r
    search->add("p q r");
    search->add("p");
    search->add("q");
    auto target = ds::text_to_rule("r", limit_size);
    bool success = false;
    auto count = search->execute([&success, &target](ds::rule_t* rule) {
        if (memcmp(rule, target.get(), rule->data_size()) == 0) {
            success = true;
            return true;
        }
        return false;
    });
    EXPECT_EQ(count, 1);
    EXPECT_TRUE(success);
}

TEST_F(TestChain, execute_multiple_premises_partial) {
    // p q r 表示：p, q |- r (两个 premises)
    // 只有 p，没有 q，在 chain_t 中不会产生部分结果
    // 因为 chain_t 的设计是在单轮内匹配所有 premises
    search->add("p q r");
    search->add("p");
    auto count = search->execute([](ds::rule_t* rule) { return false; });
    // 没有匹配完所有 premises，不会产生任何结果
    EXPECT_EQ(count, 0);
}

TEST_F(TestChain, execute_three_premises) {
    // p q r s 表示：p, q, r |- s (三个 premises)
    // 在单轮中应该同时匹配 p, q, r，直接得到 s
    search->add("p q r s");
    search->add("p");
    search->add("q");
    search->add("r");
    auto target = ds::text_to_rule("s", limit_size);
    bool success = false;
    auto count = search->execute([&success, &target](ds::rule_t* rule) {
        if (memcmp(rule, target.get(), rule->data_size()) == 0) {
            success = true;
            return true;
        }
        return false;
    });
    EXPECT_EQ(count, 1);
    EXPECT_TRUE(success);
}

TEST_F(TestChain, execute_duplicated_fact) {
    search->add("p r");
    search->add("q r");
    search->add("p");
    search->add("q");
    auto count = search->execute([](ds::rule_t* rule) { return false; });
    EXPECT_EQ(count, 1);
}

TEST_F(TestChain, execute_exceed) {
    search->set_limit_size(100);
    EXPECT_TRUE(search->add("(2 `x) (`x `x`)"));
    EXPECT_TRUE(search->add("(2 a-very-long-fact-that-exceeds-half-of-the-limit-size)"));
    auto count = search->execute([](ds::rule_t* rule) { return false; });
    EXPECT_EQ(count, 0);
}
