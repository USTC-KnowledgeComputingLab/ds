# Note: When submitting to the official vcpkg registry, update the REF
# to the git tag and calculate the SHA512 hash of the source archive.
# For local overlay ports testing, SHA512 can be set to 0.
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
