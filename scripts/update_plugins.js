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
    "ScopeMonitorTool": "スコープモニター",
    "YMM4Physics2D": "物理演算"
};

const TOPIC_LABELS = {
    "ymm4-tool": "ツール",
    "ymm4-tachie": "立ち絵",
    "ymm4-video-effect": "映像エフェクト",
    "ymm4-audio-effect": "音声エフェクト",
    "ymm4-shape": "図形"
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

async function getRepoTopics(repoName) {
    const url = `https://api.github.com/repos/${GITHUB_USER}/${repoName}`;
    const token = process.env.GITHUB_TOKEN;

    const headers = {
        'User-Agent': 'Update-Readme-Script',
        'Accept': 'application/vnd.github+json',
        ...(token && { 'Authorization': `token ${token}` })
    };

    try {
        const res = await fetch(url, { headers });
        if (!res.ok) return [];

        const data = await res.json();
        return data.topics || [];
    } catch (e) {
        console.error(`Topic fetch error (${repoName}):`, e);
        return [];
    }
}

function resolveCategory(topics) {
   return topics
        .filter(t => TOPIC_LABELS[t])
        .map(t => TOPIC_LABELS[t])
        .join(" / ") || "その他";
}


async function generateTable() {
    let table = "|プラグイン|バージョン|リンク|種類|\n";
    table += "|-|-|-|-|\n";

    for (const [repo, name] of Object.entries(PLUGINS)) {
        const [version, topics] = await Promise.all([
            getLatestVersion(repo),
            getRepoTopics(repo)
        ]);
        const category = resolveCategory(topics);
        const link = `[${repo}](https://github.com/${GITHUB_USER}/${repo})`;
        table += `|${name}|${version}|${link}|${category}|\n`;
    }
    return table;
}

async function updateReadme() {
    try {
        let content = fs.readFileSync(README_PATH, 'utf8');

        const newTable = await generateTable();

        // 表の更新
        content = content.replace(
            /<!-- PLUGIN_TABLE_START -->[\s\S]*?<!-- PLUGIN_TABLE_END -->/,
            `<!-- PLUGIN_TABLE_START -->\n${newTable}\n<!-- PLUGIN_TABLE_END -->`
        );

        // 日付の更新
        const today = new Date().toLocaleDateString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });

        content = content.replace(
            /<!-- UPDATED_AT -->[\s\S]*?(?=\n|$)/,
            `<!-- UPDATED_AT --> ${today}`
        );

        fs.writeFileSync(README_PATH, content, 'utf8');
        console.log("README updated successfully!");

    } catch (e) {
        console.error("Error updating readme:", e);
        process.exit(1);
    }
}


updateReadme();
