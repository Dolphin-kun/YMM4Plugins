const fs = require('fs');
const path = require('path');

const GITHUB_USER = "Dolphin-kun";
const README_PATH = path.join(__dirname, '../README.md');

const PLUGINS = {
    "ReflectEffect": "反射",
    "ArcText": "アーチ配置",
    "EffectTrigger": "エフェクトトリガー",
    "ShuffleText": "シャッフルテキスト",
    "LyricMotion": "リリックモーションしながら登場退場",
    "MotionDetection": "動体検知",
    "PartsSplitter": "パーツ分解",
    "Afterimage": "残像",
    "YMM4DiscordTTS": "YMM4Discord読み上げ",
    "FormulaText": "LaTeX数式",
    "YMM4FileExplorer": "YMM4エクスプローラー",
    "YMM4Clipboard": "YMM4クリップボード",
    "TextSplitter": "テキスト分割",
    "ScopeMonitor": "スコープモニター"
};

async function getLatestVersion(repoName) {
    const url = `https://api.github.com/repos/${GITHUB_USER}/${repoName}/releases/latest`;
    const token = process.env.GITHUB_TOKEN;
    const headers = {
        'User-Agent': 'Update-Readme-Script',
        ...(token && { 'Authorization': `token ${token}` })
    };

    try {
        const res = await fetch(url, { headers });
        if (res.ok) {
            const data = await res.json();
            return data.tag_name || "v?.?.?";
        } else {
            console.error(`Failed to fetch ${repoName}: ${res.status}`);
            return "Beta";
        }
    } catch (error) {
        console.error(`Error fetching ${repoName}:`, error);
        return "Error";
    }
}

async function generateTable() {
    let table = "|プラグイン|バージョン|リンク|\n";
    table += "|-|-|-|\n";

    for (const [repo, name] of Object.entries(PLUGINS)) {
        const version = await getLatestVersion(repo);
        const link = `[${repo}](https://github.com/${GITHUB_USER}/${repo})`;
        table += `|${name}|${version}|${link}|\n`;
    }
    return table;
}

async function updateReadme() {
    try {
        let content = fs.readFileSync(README_PATH, 'utf8');

        const newTable = await generateTable();
        const tableRegex =　/<!-- PLUGIN_TABLE_START -->[\s\S]*?<!-- PLUGIN_TABLE_END -->/;
        content = content.replace(tableRegex, `$1\n${newTable}$3`);

        const today = new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit' });
        const dateRegex =　/<!-- UPDATED_AT -->[\s\S]*?(?=\n|$)/;
        content = content.replace(dateRegex, `$1\n${today}\n$3`);

        fs.writeFileSync(README_PATH, content, 'utf8');
        console.log("README updated successfully!");

    } catch (e) {
        console.error("Error updating readme:", e);
        process.exit(1);
    }
}

updateReadme();
