#! /bin/sh

diff  -r node_modules.bak/ node_modules/ -q | grep 'differ$' | cut -d' ' -f4 | grep -v -F /.pnpm/ | sed -E 's|^node_modules[^/]*?/||' |
while read f
do
diff -u node_modules{.bak,}/$f
done
