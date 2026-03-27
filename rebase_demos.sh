#!/bin/bash

SOURCE="main"
git fetch origin $SOURCE

# List of demo branches to process
branches=$(git branch --list 'demo-*' | sed 's/*//g' | xargs)

for branch in $branches; do
    echo -e "\n--- Processing $branch ---"
    git checkout "$branch"
    
    # -Xours tells git to automatically favor main's version for these specific files
    if git rebase "origin/$SOURCE" -Xours package.json -Xours package-lock.json; then
        echo "✅ $branch updated."
        git push origin "$branch" --force
    else
        echo "⚠️ Conflict in $branch (likely App.jsx). Please fix manually."
        exit 1
    fi
done

git checkout $SOURCE
echo "All branches synced with full dependency list."