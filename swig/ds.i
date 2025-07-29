%module ds

%{
#include <ds/ds.hh>
#include <memory>
#include <string_view>
#include <string>

template<typename T>
auto from_string(const std::string_view& string, int buffer_size) -> std::unique_ptr<T> {
    auto result = reinterpret_cast<T*>(operator new(buffer_size));
    auto scan_result = result->scan(string.data(), reinterpret_cast<std::byte*>(result) + buffer_size);
    if (scan_result == nullptr) [[unlikely]] {
        operator delete(result);
        return std::unique_ptr<T>(nullptr);
    }
    return std::unique_ptr<T>(result);
}

template<typename T>
auto to_string(T* value, int buffer_size) -> std::string {
    auto result = reinterpret_cast<char*>(operator new(buffer_size));
    auto print_result = value->print(result, reinterpret_cast<char*>(result) + buffer_size);
    if (print_result == nullptr || print_result - result == buffer_size) [[unlikely]] {
        operator delete(result);
        return std::string();
    }
    *print_result = '\0';
    auto string = std::string(result);
    operator delete(result);
    return string;
}
%}

%include <std_unique_ptr.i>
%include <std_string_view.i>
%include <std_string.i>

template<typename T>
auto from_string(const std::string_view& string, int buffer_size) -> std::unique_ptr<T>;

template<typename T>
auto to_string(T* value, int buffer_size) -> std::string;

%unique_ptr(ds::string_t)
%template(string_t_from_string) from_string<ds::string_t>;
%template(string_t_to_string) to_string<ds::string_t>;

%unique_ptr(ds::list_t)
%template(list_t_from_string) from_string<ds::list_t>;
%template(list_t_to_string) to_string<ds::list_t>;

namespace ds {
    class string_t {
    public:
        int get_length();
    };

    class list_t {
    };
}
