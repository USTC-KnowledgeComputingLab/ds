#ifndef DS_CHAIN_HH
#define DS_CHAIN_HH

#include <functional>
#include <map>
#include <memory>
#include <string_view>

#include <ds/rule.hh>

namespace ds {
    /// @brief 用于进行链式推理搜索的类。
    /// @note 与 search_t 不同，chain_t 在单轮中会将 rule 的所有 premises 全部匹配完成。
    class chain_t {
        /// @brief 用于比较 rule_t 的智能指针大小的类型，用于将其存储在 map 中。
        /// @note 该类型比较的是 rule_t 对象的大小，而不是指针地址。
        struct less_t {
            /// @brief 判断两个 rule_t 的智能指针的大小关系。
            /// @param lhs 第一个 rule_t 的智能指针。
            /// @param rhs 第二个 rule_t 的智能指针。
            /// @return 如果第一个 rule_t 的智能指针小于第二个，则返回 true；否则返回 false。
            /// @note 该比较函数比较的是 rule_t 对象的大小，而不是指针地址。
            bool operator()(const std::unique_ptr<rule_t>& lhs, const std::unique_ptr<rule_t>& rhs) const;
        };

        /// @brief 每个有效 rule_t 的最大长度。
        length_t limit_size;
        /// @brief 在搜索过程中使用的缓冲区最大长度。
        length_t buffer_size;

        /// @brief 已经完成的 cycle，表示在此与此之前的所有 rules 和 facts 都已经被处理过。
        length_t done_cycle;
        /// @brief rules 库和 facts 库中最大的 cycle，此变量在更新 rules 和 facts 前设置。
        length_t current_cycle;
        /// @brief 用于存储规则的 map，键为 rule_t 的智能指针，值为其对应的 cycle。
        std::map<std::unique_ptr<rule_t>, length_t, less_t> rules;
        /// @brief 用于存储事实的 map，键为 rule_t 的智能指针，值为其对应的 cycle。
        std::map<std::unique_ptr<rule_t>, length_t, less_t> facts;

        /// @brief 用于存储搜索过程中使用的缓冲区。
        std::unique_ptr<rule_t> buffer;
        /// @brief 用于存储链式匹配过程中使用的中间结果缓冲区。
        std::unique_ptr<rule_t> chain_buffer;
      public:
        /// @brief 构造函数，用于初始化搜索对象
        /// @param _limit_size 每个有效 rule_t 的最大长度。
        /// @param _buffer_size 在搜索过程中使用的缓冲区最大长度。
        chain_t(length_t _limit_size, length_t _buffer_size);

        /// @brief 设置每个有效 rule_t 的最大长度。
        /// @param _limit_size 每个有效 rule_t 的最大长度。
        void set_limit_size(length_t _limit_size);

        /// @brief 设置在搜索过程中使用的缓冲区最大长度。
        /// @param _buffer_size 在搜索过程中使用的缓冲区最大长度。
        void set_buffer_size(length_t _buffer_size);

        /// @brief 重置搜索过程中的所有状态。
        void reset();

        /// @brief 向本搜索对象添加一个 rule 或 fact。
        /// @param text 描述 rule 或 fact 的文本。
        /// @return 如果添加成功则返回 true，否则返回 false。
        bool add(std::string_view text);

        /// @brief 执行一轮搜索操作，遍历所有规则和事实，并对每个匹配的规则执行回调函数。
        /// @param callback 回调函数，每个新中找到的结果都会调用此函数。
        /// @return 搜索到新的结果的数量。
        /// @note 如果回调函数返回 false，则继续搜索；如果回调函数返回 true，则停止搜索。
        length_t execute(const std::function<bool(rule_t*)>& callback);
    };
} // namespace ds

#endif
