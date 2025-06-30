# Gitee 公开仓库 API 访问文档

本文档详细描述了如何使用 Gitee API v5 来访问公开仓库中的文件内容。

## 获取仓库文件内容

你可以通过 Gitee API 的 `GET /repos/{owner}/{repo}/contents/{path}` 端点来获取公开仓库中特定文件的内容。对于公开仓库，你通常不需要提供 `access_token`。

### API 端点

```
GET /api/v5/repos/{owner}/{repo}/contents/{path}
```

### 请求参数

| 参数    | 类型   | 是否必须 | 描述                                                     |
| :------ | :----- | :------- | :------------------------------------------------------- |
| `owner` | string | 是       | 仓库所属的用户或组织的路径（path）                       |
| `repo`  | string | 是       | 仓库路径                                                 |
| `path`  | string | 是       | 文件的路径                                               |
| `ref`   | string | 否       | 分支、标签或 commit 的 SHA。默认为仓库的默认分支。 |

### 响应

API 将返回一个包含文件详情的 JSON 对象。文件的内容会以 Base64 编码的形式存在于 `content` 字段中。你需要对该字符串进行解码以获取原始文件内容。

### `curl` 请求示例

以下是一个使用 `curl` 获取文件内容的示例。这个例子将获取 `oschina` 组织下 `mcp-gitee` 仓库中的 `README.md` 文件。

```bash
curl "https://gitee.com/api/v5/repos/oschina/mcp-gitee/contents/README.md"
```

### 响应示例（部分）

```json
{
  "type": "file",
  "encoding": "base64",
  "size": 1660,
  "name": "README.md",
  "path": "README.md",
  "content": "IyBH...",
  "sha": "b742d52e957399a2342b354b4a6517be85f8f87c",
  "url": "https://gitee.com/api/v5/repos/oschina/mcp-gitee/contents/README.md",
  "html_url": "https://gitee.com/oschina/mcp-gitee/blob/master/README.md",
  "download_url": "https://gitee.com/oschina/mcp-gitee/raw/master/README.md",
  "_links": {
    "self": "https://gitee.com/api/v5/repos/oschina/mcp-gitee/contents/README.md",
    "html": "https://gitee.com/oschina/mcp-gitee/blob/master/README.md"
  }
}
```

### 如何解码文件内容

获取到 API 响应后，你需要从 JSON 中提取 `content` 字段的值，并使用 Base64 解码库对其进行解码，从而得到文件的原始内容。

例如，在 JavaScript (Node.js) 中，你可以这样做：

```javascript
const content = "IyBH..."; // 从 API 响应中获取的 content 字段值
const decodedContent = Buffer.from(content, 'base64').toString('utf-8');
console.log(decodedContent);
```

在 Python 中，你可以这样做：

```python
import base64

content = "IyBH..." # 从 API 响应中获取的 content 字段值
decoded_content = base64.b64decode(content).decode('utf-8')
print(decoded_content)
```

### 我的仓库地址（实例）
- https://gitee.com/haozelee/MusicStorage
软件中默认的gitee仓库地址