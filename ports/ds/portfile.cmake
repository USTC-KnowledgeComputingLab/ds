vcpkg_from_github(
    OUT_SOURCE_PATH SOURCE_PATH
    REPO USTC-KnowledgeComputingLab/ds
    REF "${VERSION}"
    SHA512 0
)

vcpkg_cmake_configure(
    SOURCE_PATH "${SOURCE_PATH}"
    OPTIONS
        -DDS_BUILD_EXAMPLES=OFF
)

vcpkg_cmake_build()

vcpkg_cmake_install()

vcpkg_cmake_config_fixup(PACKAGE_NAME ds CONFIG_PATH lib/cmake/ds)

vcpkg_install_copyright(FILE_LIST "${SOURCE_PATH}/LICENSE.md")
