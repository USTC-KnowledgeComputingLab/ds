#ifndef DS_GENERATOR_HH
#define DS_GENERATOR_HH

#include <coroutine>
#include <exception>
#include <utility>

namespace ds {
    template<typename T>
    class _generator_promise;

    template<typename T>
    class _generator {
        using promise_type = _generator_promise<T>;
        using handle_type = std::coroutine_handle<promise_type>;
        handle_type handle_;

      public:
        struct iterator {
            handle_type h_;

            T& operator*() const noexcept {
                return h_.promise().value_;
            }
            iterator& operator++() {
                h_.resume();
                if (h_.done()) {
                    h_ = nullptr;
                }
                return *this;
            }
            bool operator==(std::nullptr_t) const noexcept {
                return h_ == nullptr;
            }
            bool operator!=(std::nullptr_t) const noexcept {
                return h_ != nullptr;
            }
        };

        _generator(_generator&& other) noexcept : handle_(other.handle_) {
            other.handle_ = nullptr;
        }
        _generator& operator=(_generator&& other) noexcept {
            if (this != &other) {
                if (handle_) {
                    handle_.destroy();
                }
                handle_ = other.handle_;
                other.handle_ = nullptr;
            }
            return *this;
        }

        ~_generator() {
            if (handle_) {
                handle_.destroy();
            }
        }

        iterator begin() {
            if (!handle_) {
                return {nullptr};
            }
            handle_.resume();
            if (handle_.done()) {
                return {nullptr};
            }
            return {handle_};
        }
        std::nullptr_t end() {
            return nullptr;
        }

      private:
        _generator() noexcept : handle_(nullptr) { }
        explicit _generator(handle_type h) noexcept : handle_(h) { }
        friend class _generator_promise<T>;
    };

    template<typename T>
    class _generator_promise {
      public:
        T value_;

        _generator<T> get_return_object() noexcept {
            return _generator<T>(std::coroutine_handle<_generator_promise>::from_promise(*this));
        }
        std::suspend_always initial_suspend() noexcept {
            return {};
        }
        std::suspend_always final_suspend() noexcept {
            return {};
        }
        std::suspend_always yield_value(T& value) noexcept {
            value_ = value;
            return {};
        }
        std::suspend_always yield_value(T&& value) noexcept {
            value_ = std::move(value);
            return {};
        }
        void return_void() noexcept { }
        void unhandled_exception() {
            std::terminate();
        }
    };

#if defined(__cpp_lib_generator) && 0
    template<typename T>
    using generator = std::generator<T>;
#else
    template<typename T>
    using generator = _generator<T>;
#endif
} // namespace ds

namespace std {
    template<typename T, typename... Args>
    struct coroutine_traits<ds::_generator<T>, Args...> {
        using promise_type = ds::_generator_promise<T>;
    };
} // namespace std

#endif
