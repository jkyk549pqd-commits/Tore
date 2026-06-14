/**
 * 生成随机文本
 * @description 使用 lorem-ipsum 生成随机文本，支持配置段落数量、句子数量、单词数量等
 * @param {Object} options - 配置选项
 * @param {number} options.count - 生成的数量（默认：3）
 * @param {string} options.units - 单位类型：'paragraphs'（段落）、'sentences'（句子）、'words'（单词）（默认：'paragraphs'）
 * @param {number} options.sentenceLowerBound - 每个段落的句子最小数量（默认：4）
 * @param {number} options.sentenceUpperBound - 每个段落的句子最大数量（默认：8）
 * @param {number} options.paragraphLowerBound - 段落最小数量（默认：3）
 * @param {number} options.paragraphUpperBound - 段落最大数量（默认：7）
 * @param {string} options.format - 格式类型：'plain'（纯文本）、'html'（HTML格式）（默认：'plain'）
 * @returns {string} 生成的文本
 */
import { loremIpsum } from "lorem-ipsum";

export const GenRandomText = (options = {}) => {
  const {
    count = 3,
    units = "paragraphs",
    sentenceLowerBound = 4,
    sentenceUpperBound = 8,
    paragraphLowerBound = 3,
    paragraphUpperBound = 7,
    format = "plain",
  } = options;

  // 单位映射
  const unitsMap = {
    paragraphs: "paragraphs",
    sentences: "sentences",
    words: "words",
  };

  // 格式映射
  const formatMap = {
    plain: "plain",
    html: "html",
  };

  const text = loremIpsum({
    count,
    units: unitsMap[units] || unitsMap.paragraphs,
    sentenceLowerBound,
    sentenceUpperBound,
    paragraphLowerBound,
    paragraphUpperBound,
    format: formatMap[format] || formatMap.plain,
  });

  return text;
};

// 随机数据生成辅助函数
const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randomFloat = (min, max) =>
  (Math.random() * (max - min) + min).toFixed(2);
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomBool = () => Math.random() > 0.5;
const generateRandomString = (length) => {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
const randomDate = () => {
  const start = new Date(2024, 0, 1);
  const end = new Date(2025, 11, 31);
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  )
    .toISOString()
    .split("T")[0];
};

/**
 * 根据文件格式生成示例内容
 * @param {string} format - 文件格式类型
 * @returns {string} 生成的示例内容
 */
export const generateDemoContent = (format) => {
  switch (format) {
    case "md":
      return generateMDDemo();
    case "yaml":
      return generateYamlDemo();
    case "xml":
      return generateXmlDemo();
    case "toml":
      return generateTomlDemo();
    case "properties":
      return generatePropertiesDemo();
    case "dockerfile":
      return generateDockerfileDemo();
    case "shell":
      return generateShellDemo();
    case "sql":
      return generateSqlDemo();
    case "conf":
      return generateConfDemo();
    case "text":
    default:
      return GenRandomText();
  }
};

/**
 * 生成 YAML 示例内容
 */
export const generateYamlDemo = () => {
  const appNames = [
    "My Application",
    "Service Platform",
    "Data Processor",
    "Web Gateway",
    "API Server",
  ];
  const dbTypes = ["postgresql", "mysql", "mongodb", "redis", "elasticsearch"];
  const levels = ["debug", "info", "warn", "error"];
  const formats = ["json", "text", "xml"];
  const featureNames = [
    "authentication",
    "authorization",
    "caching",
    "monitoring",
    "logging",
    "security",
  ];
  const providers = ["local", "oauth", "ldap", "saml", "jwt"];
  const roles = ["admin", "user", "guest", "moderator", "developer"];

  const appName = randomItem(appNames);
  const version = `${randomInt(1, 3)}.${randomInt(0, 9)}.${randomInt(0, 99)}`;
  const dbType = randomItem(dbTypes);
  const port = randomInt(3000, 9000);
  const dbPort = randomInt(3306, 6379);
  const minPool = randomInt(3, 10);
  const maxPool = randomInt(minPool + 10, minPool + 50);

  return `# YAML 示例配置 - ${randomDate()}
application:
  name: "${appName}"
  version: "${version}"
  description: "${GenRandomText({ count: 1, units: "sentences" })}"

database:
  type: "${dbType}"
  host: "localhost"
  port: ${dbPort}
  name: "${appName.toLowerCase().replace(/\s+/g, "_")}_db"
  credentials:
    username: "admin"
    password: "secret${randomInt(100, 999)}"
  pool:
    min: ${minPool}
    max: ${maxPool}

server:
  host: "0.0.0.0"
  port: ${port}
  ssl:
    enabled: ${randomBool()}
    certificate: "/path/to/cert.pem"
    key: "/path/to/key.pem"

logging:
  level: "${randomItem(levels)}"
  format: "${randomItem(formats)}"
  output: "stdout"
  file:
    path: "/var/log/${appName.toLowerCase().replace(/\s+/g, "-")}.log"
    max_size: "${randomInt(50, 500)}MB"
    max_age: "${randomInt(7, 30)}d"

features:
${Array.from({ length: randomInt(2, 5) }, (_, i) => {
  const featureName = randomItem(featureNames);
  const enabled = randomBool();
  const featureProviders = Array.from({ length: randomInt(1, 3) }, () =>
    randomItem(providers)
  );
  const featureRoles = Array.from({ length: randomInt(2, 4) }, () =>
    randomItem(roles)
  );
  return `  - name: "${featureName}"
    enabled: ${enabled}
    providers:
${featureProviders.map((p) => `      - "${p}"`).join("\n")}
    roles:
${featureRoles.map((r) => `      - "${r}"`).join("\n")}`;
}).join("\n")}
`;
};

/**
 * 生成 XML 示例内容
 */
export const generateXmlDemo = () => {
  const appNames = [
    "My Application",
    "Service Platform",
    "Data Processor",
    "Web Gateway",
    "API Server",
  ];
  const dbTypes = ["postgresql", "mysql", "mongodb", "redis", "elasticsearch"];
  const levels = ["debug", "info", "warn", "error"];
  const formats = ["json", "text", "xml"];
  const featureNames = [
    "authentication",
    "authorization",
    "caching",
    "monitoring",
    "logging",
    "security",
  ];
  const providers = ["local", "oauth", "ldap", "saml", "jwt"];
  const roles = ["admin", "user", "guest", "moderator", "developer"];

  const appName = randomItem(appNames);
  const version = `${randomInt(1, 3)}.${randomInt(0, 9)}.${randomInt(0, 99)}`;
  const dbType = randomItem(dbTypes);
  const port = randomInt(3000, 9000);
  const dbPort = randomInt(3306, 6379);
  const minPool = randomInt(3, 10);
  const maxPool = randomInt(minPool + 10, minPool + 50);

  return `<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <application>
    <name>${appName}</name>
    <version>${version}</version>
    <description>${GenRandomText({
      count: 1,
      units: "sentences",
    })}</description>
  </application>
  
  <database>
    <type>${dbType}</type>
    <host>localhost</host>
    <port>${dbPort}</port>
    <name>${appName.toLowerCase().replace(/\s+/g, "_")}_db</name>
    <credentials>
      <username>admin</username>
      <password>secret${randomInt(100, 999)}</password>
    </credentials>
    <pool>
      <min>${minPool}</min>
      <max>${maxPool}</max>
    </pool>
  </database>
  
  <server>
    <host>0.0.0.0</host>
    <port>${port}</port>
    <ssl>
      <enabled>${randomBool()}</enabled>
      <certificate>/path/to/cert.pem</certificate>
      <key>/path/to/key.pem</key>
    </ssl>
  </server>
  
  <logging>
    <level>${randomItem(levels)}</level>
    <format>${randomItem(formats)}</format>
    <output>stdout</output>
    <file>
      <path>/var/log/${appName.toLowerCase().replace(/\s+/g, "-")}.log</path>
      <max_size>${randomInt(50, 500)}MB</max_size>
      <max_age>${randomInt(7, 30)}d</max_age>
    </file>
  </logging>
  
  <features>
${Array.from({ length: randomInt(2, 5) }, (_, i) => {
  const featureName = randomItem(featureNames);
  const enabled = randomBool();
  const featureProviders = Array.from({ length: randomInt(1, 3) }, () =>
    randomItem(providers)
  );
  const featureRoles = Array.from({ length: randomInt(2, 4) }, () =>
    randomItem(roles)
  );
  return `    <feature name="${featureName}" enabled="${enabled}">
      <providers>
${featureProviders.map((p) => `        <provider>${p}</provider>`).join("\n")}
      </providers>
      <roles>
${featureRoles.map((r) => `        <role>${r}</role>`).join("\n")}
      </roles>
    </feature>`;
}).join("\n")}
  </features>
</configuration>
`;
};

/**
 * 生成 TOML 示例内容
 */
export const generateTomlDemo = () => {
  const appNames = [
    "My Application",
    "Service Platform",
    "Data Processor",
    "Web Gateway",
    "API Server",
  ];
  const dbTypes = ["postgresql", "mysql", "mongodb", "redis", "elasticsearch"];
  const levels = ["debug", "info", "warn", "error"];
  const formats = ["json", "text", "xml"];
  const featureNames = [
    "authentication",
    "authorization",
    "caching",
    "monitoring",
    "logging",
    "security",
  ];
  const providers = ["local", "oauth", "ldap", "saml", "jwt"];
  const roles = ["admin", "user", "guest", "moderator", "developer"];

  const appName = randomItem(appNames);
  const version = `${randomInt(1, 3)}.${randomInt(0, 9)}.${randomInt(0, 99)}`;
  const dbType = randomItem(dbTypes);
  const port = randomInt(3000, 9000);
  const dbPort = randomInt(3306, 6379);
  const minPool = randomInt(3, 10);
  const maxPool = randomInt(minPool + 10, minPool + 50);

  return `# TOML 示例配置 - ${randomDate()}
[application]
name = "${appName}"
version = "${version}"
description = "${GenRandomText({ count: 1, units: "sentences" })}"

[database]
type = "${dbType}"
host = "localhost"
port = ${dbPort}
name = "${appName.toLowerCase().replace(/\s+/g, "_")}_db"

[database.credentials]
username = "admin"
password = "secret${randomInt(100, 999)}"

[database.pool]
min = ${minPool}
max = ${maxPool}

[server]
host = "0.0.0.0"
port = ${port}

[server.ssl]
enabled = ${randomBool()}
certificate = "/path/to/cert.pem"
key = "/path/to/key.pem"

[logging]
level = "${randomItem(levels)}"
format = "${randomItem(formats)}"
output = "stdout"

[logging.file]
path = "/var/log/${appName.toLowerCase().replace(/\s+/g, "-")}.log"
max_size = "${randomInt(50, 500)}MB"
max_age = "${randomInt(7, 30)}d"

${Array.from({ length: randomInt(2, 5) }, (_, i) => {
  const featureName = randomItem(featureNames);
  const enabled = randomBool();
  const featureProviders = Array.from({ length: randomInt(1, 3) }, () =>
    randomItem(providers)
  );
  const featureRoles = Array.from({ length: randomInt(2, 4) }, () =>
    randomItem(roles)
  );
  return `[[features]]
name = "${featureName}"
enabled = ${enabled}

[features.providers]
type = "array"
values = ${JSON.stringify(featureProviders)}

[features.roles]
type = "array"
values = ${JSON.stringify(featureRoles)}`;
}).join("\n\n")}
`;
};

/**
 * 生成 Properties 示例内容
 */
export const generatePropertiesDemo = () => {
  const appNames = [
    "My Application",
    "Service Platform",
    "Data Processor",
    "Web Gateway",
    "API Server",
  ];
  const dbTypes = ["postgresql", "mysql", "mongodb", "redis", "elasticsearch"];
  const levels = ["debug", "info", "warn", "error"];
  const formats = ["json", "text", "xml"];
  const featureNames = [
    "authentication",
    "authorization",
    "caching",
    "monitoring",
    "logging",
    "security",
  ];
  const providers = ["local", "oauth", "ldap", "saml", "jwt"];
  const roles = ["admin", "user", "guest", "moderator", "developer"];

  const appName = randomItem(appNames);
  const version = `${randomInt(1, 3)}.${randomInt(0, 9)}.${randomInt(0, 99)}`;
  const dbType = randomItem(dbTypes);
  const port = randomInt(3000, 9000);
  const dbPort = randomInt(3306, 6379);
  const minPool = randomInt(3, 10);
  const maxPool = randomInt(minPool + 10, minPool + 50);

  return `# Properties 示例配置 - ${randomDate()}

# Application Configuration
application.name=${appName}
application.version=${version}
application.description=${GenRandomText({ count: 1, units: "sentences" })}

# Database Configuration
database.type=${dbType}
database.host=localhost
database.port=${dbPort}
database.name=${appName.toLowerCase().replace(/\s+/g, "_")}_db
database.credentials.username=admin
database.credentials.password=secret${randomInt(100, 999)}
database.pool.min=${minPool}
database.pool.max=${maxPool}

# Server Configuration
server.host=0.0.0.0
server.port=${port}
server.ssl.enabled=${randomBool()}
server.ssl.certificate=/path/to/cert.pem
server.ssl.key=/path/to/key.pem

# Logging Configuration
logging.level=${randomItem(levels)}
logging.format=${randomItem(formats)}
logging.output=stdout
logging.file.path=/var/log/${appName.toLowerCase().replace(/\s+/g, "-")}.log
logging.file.max_size=${randomInt(50, 500)}MB
logging.file.max_age=${randomInt(7, 30)}d

# Features Configuration
${Array.from({ length: randomInt(2, 5) }, (_, i) => {
  const featureName = randomItem(featureNames);
  const enabled = randomBool();
  const featureProviders = Array.from({ length: randomInt(1, 3) }, () =>
    randomItem(providers)
  );
  const featureRoles = Array.from({ length: randomInt(2, 4) }, () =>
    randomItem(roles)
  );
  return `features.${featureName}.enabled=${enabled}
features.${featureName}.providers=${featureProviders.join(",")}
features.${featureName}.roles=${featureRoles.join(",")}`;
}).join("\n")}
`;
};

/**
 * 生成 Dockerfile 示例内容
 */
export const generateDockerfileDemo = () => {
  const nodeVersions = ["16", "18", "20", "21"];
  const baseImages = ["alpine", "slim", "bullseye", "bookworm"];
  const port = randomInt(3000, 9000);
  const nodeVersion = randomItem(nodeVersions);
  const baseImage = randomItem(baseImages);

  return `# Dockerfile 示例配置 - ${randomDate()}
# 使用多阶段构建优化镜像大小

# 构建阶段
FROM node:${nodeVersion}-${baseImage} AS builder

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 构建应用
RUN npm run build

# 生产阶段
FROM node:${nodeVersion}-${baseImage}

# 设置工作目录
WORKDIR /app

# 从构建阶段复制依赖和构建产物
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./

# 创建非 root 用户
RUN addgroup -g ${randomInt(1000, 2000)} -S nodejs && \\
    adduser -S nodejs -u ${randomInt(1000, 2000)}

# 设置文件权限
RUN chown -R nodejs:nodejs /app

# 切换到非 root 用户
USER nodejs

# 暴露端口
EXPOSE ${port}

# 健康检查
HEALTHCHECK --interval=${randomInt(20, 60)}s --timeout=${randomInt(
    2,
    5
  )}s --start-period=${randomInt(5, 15)}s --retries=${randomInt(2, 5)} \\
  CMD node -e "require('http').get('http://localhost:${port}/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 启动应用
CMD ["node", "dist/index.js"]
`;
};

/**
 * 生成 Shell Script 示例内容
 */
export const generateShellDemo = () => {
  const appNames = [
    "myapp",
    "service-platform",
    "data-processor",
    "web-gateway",
    "api-server",
  ];
  const appName = randomItem(appNames);
  const port = randomInt(3000, 9000);
  const healthInterval = randomInt(20, 60);
  const healthTimeout = randomInt(2, 5);

  return `#!/bin/bash

# Shell Script 示例 - ${randomDate()}
# 用途：应用程序部署脚本

set -e  # 遇到错误时退出脚本

# 配置变量
APP_NAME="${appName}"
APP_DIR="/opt/${appName}"
BACKUP_DIR="/var/backups/${appName}"
LOG_FILE="/var/log/${appName}/deploy.log"
GIT_REPO="https://github.com/example/${appName}.git"
GIT_BRANCH="${randomItem(["main", "develop", "master", "production"])}"

# 颜色输出
RED='\\033[0;31m'
GREEN='\\033[0;32m'
YELLOW='\\033[1;33m'
NC='\\033[0m' # No Color

# 日志函数
log() {
    echo -e "\${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]\${NC} $1"
}

error() {
    echo -e "\${RED}[ERROR]\${NC} $1" >&2
}

warn() {
    echo -e "\${YELLOW}[WARNING]\${NC} $1"
}

# 检查是否为 root 用户
check_root() {
    if [[ $EUID -eq 0 ]]; then
        error "请不要使用 root 用户运行此脚本"
        exit 1
    fi
}

# 创建必要的目录
create_directories() {
    log "创建必要的目录..."
    mkdir -p "\${APP_DIR}"
    mkdir -p "\${BACKUP_DIR}"
    mkdir -p "\$(dirname \${LOG_FILE})"
    log "目录创建完成"
}

# 备份当前版本
backup_current() {
    if [[ -d "\${APP_DIR}" ]]; then
        log "备份当前版本..."
        BACKUP_FILE="\${BACKUP_DIR}/backup-\$(date +%Y%m%d-%H%M%S).tar.gz"
        tar -czf "\${BACKUP_FILE}" -C "\${APP_DIR}" .
        log "备份完成: \${BACKUP_FILE}"
    else
        warn "没有找到现有应用，跳过备份"
    fi
}

# 拉取最新代码
pull_latest_code() {
    log "拉取最新代码..."
    if [[ -d "\${APP_DIR}/.git" ]]; then
        cd "\${APP_DIR}"
        git fetch origin
        git checkout "\${GIT_BRANCH}"
        git pull origin "\${GIT_BRANCH}"
    else
        git clone -b "\${GIT_BRANCH}" "\${GIT_REPO}" "\${APP_DIR}"
        cd "\${APP_DIR}"
    fi
    log "代码更新完成"
}

# 安装依赖
install_dependencies() {
    log "安装依赖..."
    cd "\${APP_DIR}"
    if [[ -f "package.json" ]]; then
        npm ci --production
    elif [[ -f "requirements.txt" ]]; then
        pip install -r requirements.txt
    fi
    log "依赖安装完成"
}

# 重启服务
restart_service() {
    log "重启服务..."
    systemctl restart "\${APP_NAME}" || error "服务重启失败"
    systemctl enable "\${APP_NAME}"
    log "服务重启完成"
}

# 主函数
main() {
    log "开始部署 \${APP_NAME}..."
    
    check_root
    create_directories
    backup_current
    pull_latest_code
    install_dependencies
    restart_service
    
    log "部署完成！"
    log "日志文件: \${LOG_FILE}"
}

# 运行主函数
main "$@" 2>&1 | tee -a "\${LOG_FILE}"
`;
};

/**
 * 生成 Markdown 示例内容
 */
export const generateMDDemo = () => {
  const appNames = [
    "My Application",
    "Service Platform",
    "Data Processor",
    "Web Gateway",
    "API Server",
  ];
  const dbTypes = ["PostgreSQL", "MySQL", "MongoDB", "Redis", "Elasticsearch"];
  const levels = ["Debug", "Info", "Warn", "Error"];
  const formats = ["JSON", "Text", "XML"];
  const featureNames = [
    "Authentication",
    "Authorization",
    "Caching",
    "Monitoring",
    "Logging",
    "Security",
  ];
  const providers = ["Local", "OAuth", "LDAP", "SAML", "JWT"];
  const roles = ["Admin", "User", "Guest", "Moderator", "Developer"];

  const appName = randomItem(appNames);
  const version = `${randomInt(1, 3)}.${randomInt(0, 9)}.${randomInt(0, 99)}`;
  const dbType = randomItem(dbTypes);
  const port = randomInt(3000, 9000);
  const dbPort = randomInt(3306, 6379);
  const minPool = randomInt(3, 10);
  const maxPool = randomInt(minPool + 10, minPool + 50);

  const featuresArray = Array.from({ length: randomInt(2, 5) }, (_, i) => {
    const featureName = randomItem(featureNames);
    const enabled = randomBool();
    const featureProviders = Array.from({ length: randomInt(1, 3) }, () =>
      randomItem(providers)
    );
    const featureRoles = Array.from({ length: randomInt(2, 4) }, () =>
      randomItem(roles)
    );
    return {
      name: featureName,
      enabled,
      providers: featureProviders,
      roles: featureRoles,
    };
  });

  return `# Markdown 示例配置 - ${randomDate()}

> 这是一个 Markdown 格式的配置文档示例。

---

## 1. 应用信息

**应用名称**: ${appName}
**版本号**: ${version}
**描述**: ${GenRandomText({ count: 1, units: "sentences" })}

---

## 2. 数据库配置

| 配置项 | 值 | 说明 |
|--------|-----|------|
| 类型 | ${dbType} | 数据库类型 |
| 主机 | \`localhost\` | 数据库服务器地址 |
| 端口 | ${dbPort} | 数据库服务端口 |
| 数据库名 | \`${appName.toLowerCase().replace(/\s+/g, "_")}_db\` | 数据库名称 |

### 连接凭据

\`\`\`
用户名: admin
密码: secret${randomInt(100, 999)}
\`\`\`

### 连接池配置

- 最小连接数: ${minPool}
- 最大连接数: ${maxPool}

---

## 3. 服务器配置

- **监听地址**: \`0.0.0.0\`
- **监听端口**: ${port}
- **SSL 启用**: ${randomBool() ? "✅ 是" : "❌ 否"}

### SSL 配置

\`\`\`
证书路径: /path/to/cert.pem
私钥路径: /path/to/key.pem
\`\`\`

---

## 4. 日志配置

### 日志级别

${levels
  .map((level, index) => `${randomBool() ? "✅" : "⬜"} ${level}`)
  .join("\n")}

### 输出格式

- [${randomItem(formats) === "JSON" ? "x" : " "}] JSON
- [${randomItem(formats) === "Text" ? "x" : " "}] Text
- [${randomItem(formats) === "XML" ? "x" : " "}] XML

### 文件配置

- **日志路径**: \`/var/log/${appName.toLowerCase().replace(/\s+/g, "-")}.log\`
- **最大大小**: ${randomInt(50, 500)}MB
- **保留时间**: ${randomInt(7, 30)}天

---

## 5. 功能特性配置

${featuresArray
  .map(
    (feature, index) => `### 5.${index + 1} ${feature.name}

状态: ${feature.enabled ? "🟢 启用" : "🔴 禁用"}

**支持的身份验证方式**:
${feature.providers.map((p) => `- ${p}`).join("\n")}

**授权角色**:
${feature.roles.map((r) => `- ${r}`).join("\n")}
`
  )
  .join("\n")}

---

## 6. 快速开始

### 安装依赖

\`\`\`bash
npm install
\`\`\`

### 启动应用

\`\`\`bash
npm run start
\`\`\`

### 访问应用

\`\`\`
http://localhost:${port}
\`\`\`

---

## 7. 常见问题

### Q: 如何修改数据库连接？

A: 编辑配置文件中的 \`database\` 部分，更新 \`host\`, \`port\`, \`name\` 等参数。

### Q: 如何启用 SSL？

A: 将 \`server.ssl.enabled\` 设置为 \`true\`，并提供有效的证书文件路径。

---

## 8. 许可证

\`\`\`
MIT License

Copyright (c) 2024 ${appName}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
\`\`\`

---

**最后更新**: ${randomDate()}
`;
};

export const generateSqlDemo = () => {
  const tableNames = ["users", "products", "orders", "categories", "customers"];
  const columnTypes = [
    "INT",
    "VARCHAR(255)",
    "TEXT",
    "DECIMAL(10,2)",
    "DATETIME",
    "BOOLEAN",
    "TIMESTAMP",
  ];
  const userNames = ["Alice", "Bob", "Charlie", "David", "Emma", "Frank"];
  const emails = [
    "alice@example.com",
    "bob@test.com",
    "charlie@demo.com",
    "david@mail.com",
  ];
  const productNames = ["Laptop", "Phone", "Tablet", "Monitor", "Keyboard"];
  const statuses = ["active", "inactive", "pending", "completed", "cancelled"];

  const tableName = randomItem(tableNames);
  const numColumns = randomInt(4, 8);
  const numUsers = randomInt(3, 6);
  const numProducts = randomInt(3, 6);
  const numOrders = randomInt(3, 5);

  // Generate table columns
  const columns = Array.from({ length: numColumns }, (_, i) => {
    const isPrimary = i === 0;
    const columnName = isPrimary
      ? "id"
      : `${
          [
            "name",
            "email",
            "status",
            "price",
            "quantity",
            "created_at",
            "description",
          ][i] || "column_${i}"
        }`;
    const columnType = isPrimary
      ? "INT AUTO_INCREMENT PRIMARY KEY"
      : randomItem(columnTypes);
    return `    ${columnName} ${columnType}`;
  }).join(",\n");

  // Generate sample data for users
  const usersInsert = Array.from({ length: numUsers }, (_, i) => {
    const name = randomItem(userNames);
    const email = randomItem(emails);
    const status = randomItem(statuses);
    return `    (NULL, '${name}', '${email}', '${status}', NOW())`;
  }).join(",\n");

  // Generate sample data for products
  const productsInsert = Array.from({ length: numProducts }, (_, i) => {
    const name = randomItem(productNames);
    const price = (Math.random() * 1000 + 100).toFixed(2);
    const quantity = randomInt(10, 100);
    return `    (NULL, '${name}', ${price}, ${quantity}, NOW())`;
  }).join(",\n");

  // Generate sample data for orders
  const ordersInsert = Array.from({ length: numOrders }, (_, i) => {
    const userId = randomInt(1, numUsers);
    const status = randomItem(statuses);
    const total = (Math.random() * 5000 + 100).toFixed(2);
    return `    (NULL, ${userId}, '${status}', ${total}, NOW())`;
  }).join(",\n");

  return `-- SQL 示例 - ${randomDate()}
-- =============================================
-- 数据库结构创建
-- =============================================

-- 创建用户表
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建产品表
CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    quantity INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 创建订单表
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    total DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 插入示例数据
-- =============================================

-- 插入用户数据
INSERT INTO users (id, name, email, status, created_at) VALUES
${usersInsert};

-- 插入产品数据
INSERT INTO products (id, name, price, quantity, created_at) VALUES
${productsInsert};

-- 插入订单数据
INSERT INTO orders (id, user_id, status, total, created_at) VALUES
${ordersInsert};

-- =============================================
-- 查询示例
-- =============================================

-- 查询所有活跃用户
SELECT id, name, email, created_at
FROM users
WHERE status = 'active'
ORDER BY created_at DESC;

-- 查询产品及其库存情况
SELECT
    p.id,
    p.name,
    p.price,
    p.quantity,
    CASE
        WHEN p.quantity < 20 THEN 'Low Stock'
        WHEN p.quantity < 50 THEN 'Medium Stock'
        ELSE 'In Stock'
    END AS stock_status
FROM products p
ORDER BY p.quantity ASC;

-- 查询订单统计信息
SELECT
    o.status,
    COUNT(*) AS order_count,
    SUM(o.total) AS total_amount,
    AVG(o.total) AS average_amount
FROM orders o
GROUP BY o.status;

-- 复杂查询：用户订单汇总
SELECT
    u.id,
    u.name,
    u.email,
    COUNT(o.id) AS total_orders,
    COALESCE(SUM(o.total), 0) AS total_spent,
    MAX(o.created_at) AS last_order_date
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name, u.email
ORDER BY total_spent DESC;

-- =============================================
-- 更新示例
-- =============================================

-- 更新产品库存
UPDATE products
SET quantity = quantity - 1
WHERE id = 1;

-- 更新用户状态
UPDATE users
SET status = 'inactive'
WHERE last_login < DATE_SUB(NOW(), INTERVAL 90 DAY);

-- =============================================
-- 删除示例
-- =============================================

-- 删除已取消且超过30天的订单
DELETE FROM orders
WHERE status = 'cancelled'
AND created_at < DATE_SUB(NOW(), INTERVAL 30 DAY);

-- =============================================
-- 索引优化
-- =============================================

-- 为用户表的邮箱字段创建索引
CREATE INDEX idx_users_email ON users(email);

-- 为订单表的用户ID和状态创建复合索引
CREATE INDEX idx_orders_user_status ON orders(user_id, status);

-- 为产品表的价格和库存创建索引
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_quantity ON products(quantity);

-- =============================================
-- 视图示例
-- =============================================

-- 创建用户订单统计视图
CREATE VIEW user_order_stats AS
SELECT
    u.id,
    u.name,
    u.email,
    COUNT(o.id) AS total_orders,
    COALESCE(SUM(o.total), 0) AS total_spent
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name, u.email;

-- =============================================
-- 存储过程示例
-- =============================================

DELIMITER //

CREATE PROCEDURE GetUserOrderSummary(IN user_id INT)
BEGIN
    SELECT
        u.name,
        u.email,
        COUNT(o.id) AS order_count,
        SUM(o.total) AS total_amount
    FROM users u
    LEFT JOIN orders o ON u.id = o.user_id
    WHERE u.id = user_id
    GROUP BY u.id, u.name, u.email;
END //

DELIMITER ;

-- 调用存储过程
CALL GetUserOrderSummary(1);
`;
};

export const generateConfDemo = () => {
  const appNames = [
    "My Application",
    "Service Platform",
    "Data Processor",
    "Web Gateway",
    "API Server",
  ];
  const serverHosts = ["localhost", "127.0.0.1", "0.0.0.0", "example.com"];
  const dbTypes = ["mysql", "postgresql", "mongodb", "redis"];
  const logLevels = ["DEBUG", "INFO", "WARN", "ERROR"];

  const appName = randomItem(appNames);
  const serverHost = randomItem(serverHosts);
  const serverPort = randomInt(3000, 9000);
  const dbType = randomItem(dbTypes);
  const dbHost = serverHost;
  const dbPort =
    dbType === "mysql" ? 3306 : dbType === "postgresql" ? 5432 : 6379;
  const logLevel = randomItem(logLevels);
  const maxConnections = randomInt(10, 100);
  const timeout = randomInt(30, 120);

  return `# ${appName} 配置文件
# 最后更新: ${new Date().toLocaleDateString()}

[server]
# 服务器配置
host = ${serverHost}
port = ${serverPort}
ssl_enabled = false
max_connections = ${maxConnections}
timeout = ${timeout}
worker_processes = 4

[database]
# 数据库连接配置
type = ${dbType}
host = ${dbHost}
port = ${dbPort}
name = app_production
username = admin
password = ${generateRandomString(16)}
pool_size = 20
connection_timeout = 30
retry_attempts = 3

[cache]
# 缓存配置
enabled = true
type = redis
host = localhost
port = 6379
ttl = 3600
max_memory = 256M

[logging]
# 日志配置
level = ${logLevel}
file = /var/log/${appName.toLowerCase().replace(/\s+/g, "_")}.log
max_size = 100M
max_files = 10
format = json

[security]
# 安全配置
secret_key = ${generateRandomString(32)}
jwt_expiry = 86400
cors_enabled = true
cors_origins = http://localhost:3000,https://example.com
rate_limit = 1000

[features]
# 功能开关
auth_enabled = true
api_versioning = true
metrics_enabled = false
tracing_enabled = false

[maintenance]
# 维护模式
enabled = false
message = "系统维护中，请稍后再试"
whitelist = 127.0.0.1,192.168.1.100

[notifications]
# 通知配置
email_enabled = true
email_smtp_host = smtp.example.com
email_smtp_port = 587
email_from = noreply@example.com

sms_enabled = false
sms_provider = twilio
sms_api_key = ${generateRandomString(24)}

[backup]
# 备份配置
enabled = true
schedule = 0 2 * * *
retention_days = 30
compression = gzip
destination = /backup/${appName.toLowerCase().replace(/\s+/g, "_")}
`;
};
