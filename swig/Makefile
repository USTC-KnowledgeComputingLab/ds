csharp:
	swig -c++ -csharp ds.i
	g++ -std=c++17 -O3 -flto ds_wrap.cxx ../build/libds.a -I../include -fPIC -shared -o ds.so
