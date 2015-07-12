# dump-creator
Read a list of wiki list pages and find all sublists and retrieve the xml dump.

### Requirements

You will need
- npm
- node

### Installation

dump-creator is a CLI-tool. So best to install as global package for instant access.
It is not a published tool, so use path to this github repository.

```bash
npm install -g Wikilist-Extraction/dump-creator
```

### Usage

This instruction assumes you installed dump-creator as a global package.

```bash
# general usage
wiki-dumper id-of-list [id-of-list ...] name-of-xml-file

# retrieving multiple lists at once
wiki-dumper Lists_of_writers List_of_Donalds dump.xml
```

The dump file will be created in the current working directory. You can only define a file without a subdirectory.
