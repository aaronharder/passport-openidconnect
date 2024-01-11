#! env node
const { exec } = require("child_process");

//

async function publish() {
  const { readFile } = await import("fs/promises");
  const pkgFile = await readFile("./package.json");
  try {
    if (!(await commitsAreClear())) {
      console.log(
        `Aborting publish because you have uncommited git changes.\nRun 'git status' to see them.`
      );
      return;
    }
    const json = pkgFile.toString();
    const settings = JSON.parse(json);
    console.log("pkg/version:", settings.version);
    const tag = `v${settings.version}`;
    if (await tagExists(tag)) {
      const err = await createTag(tag);
      if (err) {
        console.warn(`Error creating tag: ${tag}`, err);
      } else {
        console.log(`Created git tag ${tag}`);
      }
    } else {
      console.log(`Tag ${tag} exists already – skipping tag creation`);
    }
    console.log(
      "\nOK, tag and version are in sync.\nNext run 'npm publish --access public'"
    );
  } catch (err) {
    console.log("ERROR\n", err);
  }
}

function commitsAreClear() {
  return new Promise((resolve) => {
    exec(`git status --short | grep . && exit 1 || exit 0`, (err) => {
      resolve(!err);
    });
  });
}

function tagExists(tag) {
  return new Promise((resolve) => {
    exec(`git rev-parse --verify refs/tags/${tag}`, (err) => {
      resolve(!err);
    });
  });
}

function createTag(tag) {
  return new Promise((resolve) => {
    exec(`git tag ${tag}`, (err) => {
      resolve(err);
    });
  });
}

publish();
