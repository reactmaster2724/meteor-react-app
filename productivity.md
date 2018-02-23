git log --author="hansel ke" --pretty=tformat: --numstat \
| printf '"added lines: %s, removed lines: %s, total lines: %s\n", add, subs, loc }' -