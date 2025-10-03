---
sidebar_position: 8
---

# Index Signature（インデックスシグネチャ）

API から次のような JSON レスポンスが返ってきたとします。

[TypeScript Playground で開く](https://www.typescriptlang.org/play/?#code/JYWwDg9gTgLgBAJQKYEMDG8BmUIjgcilQ3wChS0IA7AZ3iJslqTgF44BvUuOAIhggwUAG14AuOAGYANNz4BGAEyTxnOT17AAJqqUz1fKihBJVvQFSagOYTesnhqQgUwURP4ocAASQAPY2GFIAHSUILxyAL62fAAsAKwAbKpcdnzaqnHxURpGJmaAjUGACto2BrwOTi58ABYoRgDWEF6+4AHBuGE8kXK8AOwAHACcSSVpEn39WYbGpq6AhNbWE6WOzmYAVsCePn4tIe1w4aThANzkQA)

```json
{
  "total": 3,
  "users": {
    "123": {
      "id": 123,
      "name": "太郎",
      "email": "taro@example.com"
    },
    "456": {
      "id": 456,
      "name": "花子",
      "email": "hanako@example.com"
    },
    "789": {
      "id": 789,
      "name": "次郎",
      "email": "jiro@example.com"
    }
  }
}
```

`total` という固定プロパティと、`users` というユーザー情報のマップが含まれています。このデータに型を付けるにはどうすればよいでしょうか？

## 最初の試み：固定プロパティで定義してみる

まず、通常のインターフェースで型を定義してみます。

```tsx
interface User {
  id: number;
  name: string;
  email: string;
}

interface UsersMap {
  "123": User;
  "456": User;
  "789": User;
}

interface ApiResponse {
  total: number;
  users: UsersMap;
}
```

この定義には問題があります。

- ユーザーが増えるたびに、`UsersMap` の型定義を更新しなければならない
- API からどんな ID が返ってくるか事前に分からない
- 新しいユーザー ID（例: `"999"`）にアクセスしようとするとエラーになる

```tsx
const response: ApiResponse = {
  total: 3,
  users: {
    "123": { id: 123, name: "太郎", email: "taro@example.com" },
    "456": { id: 456, name: "花子", email: "hanako@example.com" },
    "789": { id: 789, name: "次郎", email: "jiro@example.com" },
  },
};

// ❌ エラー：プロパティ "999" は UsersMap に存在しない
const user = response.users["999"];
```

## 解決策：Index Signature を使う

**Index Signature（インデックスシグネチャ）** を使えば、動的なプロパティ名を持つオブジェクトの型を定義できます。

```tsx
interface User {
  id: number;
  name: string;
  email: string;
}

interface UsersMap {
  [userId: string]: User;
}

interface ApiResponse {
  total: number;
  users: UsersMap;
}
```

`[userId: string]: User` という記法が Index Signature です。これは「任意の文字列キーに対して、`User` 型の値が入る」という意味になります。

```tsx
const response: ApiResponse = {
  total: 3,
  users: {
    "123": { id: 123, name: "太郎", email: "taro@example.com" },
    "456": { id: 456, name: "花子", email: "hanako@example.com" },
    "789": { id: 789, name: "次郎", email: "jiro@example.com" },
    // いくつでも追加できる
    "999": { id: 999, name: "四郎", email: "shiro@example.com" }, // ✅ OK
  },
};

// ✅ 任意のキーでアクセス可能
const user = response.users["999"]; // User 型
```

これで、固定プロパティ（`total`）と動的プロパティ（`users` のユーザー ID）を組み合わせた型を定義できました

## Index Signature の基本構文

Index Signature は、`[key: Type]: ValueType` の形式で定義します。

```tsx
interface Dictionary {
  [key: string]: string;
}
```

- **`key`**: プロパティ名を表す変数名（任意の名前で OK）
- **`string`**: キーの型（`string` または `number`）
- **`string`**: 値の型

### キーの型として使えるもの

```tsx
// 文字列キー
interface StringIndex {
  [key: string]: number;
}

// 数値キー
interface NumberIndex {
  [index: number]: string;
}

// シンボルキー（あまり使われない）
interface SymbolIndex {
  [key: symbol]: boolean;
}
```

実践では、ほとんどの場合 `string` キーを使います。

## React コンポーネントでの使用

先ほどの API レスポンスを、React コンポーネントで使ってみましょう。

[TypeScript Playground で開く](https://www.typescriptlang.org/play/?#code/JYWwDg9gTgLgBAJQKYEMDG8BmUIjgcilQ3wChTMBXAOwGcAKAQTgBt6qA6AOjgF4A+OB0BUVIFSNQBoMgBgygGwZAFgyAFQzdADgznNANgzdAFQyAqhkA9DIA6G7IACWAWwBGyOG3j0AjvxI0GqqwgQE0qlDAQABelETRcQnIqQC8yAA0yAD0+QVFJWXlyAC+cHCqtpoGRiZmltZ2jsgubh5evshQGthMVjR0jMzVLOxoyNXpZeUVVTW2hSP1jc2t7Z2qXT19A6Fhw6NtE0FTLTPzS0Oh4VHxSQB0APSHyADKIDDISAByB6dkUCA5AGMYGh+M54ABVXxoXjISQAM1U6AIAGtAA)

```tsx
interface User {
  id: number;
  name: string;
  email: string;
}

interface UsersMap {
  [userId: string]: User;
}

interface ApiResponse {
  total: number;
  users: UsersMap;
}

function UserList({ response }: { response: ApiResponse }) {
  return (
    <div>
      <p>合計: {response.total}人</p>
      <ul>
        {Object.entries(response.users).map(([userId, user]) => (
          <li key={userId}>
            {user.name} ({user.email})
          </li>
        ))}
      </ul>
    </div>
  );
}

// 使用例
const apiData: ApiResponse = {
  total: 2,
  users: {
    "123": { id: 123, name: "太郎", email: "taro@example.com" },
    "456": { id: 456, name: "花子", email: "hanako@example.com" },
  },
};

function App() {
  return <UserList response={apiData} />;
}
```

### 動的なアクセス

Index Signature を使うと、任意のキーでアクセスできます。

```tsx
function getUserById(response: ApiResponse, userId: string): User | undefined {
  // Index Signature により、任意のキーでアクセス可能
  return response.users[userId];
}

const user = getUserById(apiData, "123");
if (user) {
  console.log(user.name); // "太郎"
}
```

## Record 型との比較

TypeScript には `Record` という組み込みの型もあります。Index Signature と似ていますが、使い分けがあります。

### Record 型の基本

```tsx
// Index Signature
interface UserMap1 {
  [userId: string]: User;
}

// Record 型
type UserMap2 = Record<string, User>;
```

この 2 つは、ほぼ同じ意味です。

### 使い分けのポイント

| 特徴                         | Index Signature               | Record 型                      |
| ---------------------------- | ----------------------------- | ------------------------------ |
| 固定プロパティとの組み合わせ | できる                        | できない                       |
| 拡張                         | できる（`extends` や `&` で） | 型エイリアスなので拡張しにくい |
| 簡潔さ                       | やや冗長                      | シンプル                       |

### Record 型が適している場合

シンプルなマップを定義する場合は、`Record` が便利です。

```tsx
// ✅ シンプルで読みやすい
type StatusMessages = Record<number, string>;

const messages: StatusMessages = {
  200: "OK",
  404: "Not Found",
  500: "Internal Server Error",
};
```

### Index Signature が適している場合

固定プロパティと組み合わせる場合は、Index Signature を使います。

```tsx
// ✅ 固定プロパティと動的プロパティを両方持つ
interface Config {
  version: string; // 固定プロパティ
  [key: string]: string | number; // 動的プロパティ
}

const config: Config = {
  version: "1.0.0",
  port: 3000,
  host: "localhost",
};
```

## まとめ

Index Signature は、動的なプロパティを持つオブジェクトを型安全に扱うための機能です。

- **`[key: string]: Type`** の形式で定義する
- API レスポンスやマップ構造に便利
- 固定プロパティと組み合わせる場合、Index Signature の型は広めに設定する
- `Record<K, V>` 型も似た機能を提供するが、使い分けがある
- 動的アクセスには型ガードやオプショナルチェイニングを使う

Index Signature を適切に使うことで、柔軟で型安全なコードを書けるようになります。
