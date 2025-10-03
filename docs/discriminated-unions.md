---
sidebar_position: 4
---

# 判別可能なユニオン型

[基本的な型の絞り込み](./type-narrowing-basics.md)では、`typeof` や等価性チェックを使った型の絞り込みを学びました。しかし、複雑なオブジェクト型のユニオンを扱う場合、これらの方法だけでは不十分なことがあります。

この章では、[**判別可能なユニオン型（Discriminated Unions）**](https://typescriptbook.jp/reference/values-types-variables/discriminated-union) という強力なパターンを学びます。

## 判別可能なユニオン型とは

判別可能なユニオン型は、**共通のプロパティ（判別子）** を持つ複数のオブジェクト型のユニオンです。この判別子を使って、どの型なのかを TypeScript が自動的に判定できます。

### 基本的な例

```tsx
type SuccessResponse = {
  status: "success";
  data: { id: number; name: string };
};

type ErrorResponse = {
  status: "error";
  message: string;
};

type ApiResponse = SuccessResponse | ErrorResponse;
```

この例では、`status` プロパティが **判別子** として機能します。`status` の値によって、どちらの型なのかを判定できます。

### なぜ必要なのか

判別子がないと、TypeScript はどちらの型なのか判断できません。

[TypeScript Playground で開く](https://www.typescriptlang.org/play/?#code/JYWwDg9gTgLgBAJQKYEMDG8BmUIjgcilQ3wChSYBPMJRJAZ0gDt7aBeOAbzgBMUYUALjj0YUYEwDmcAL5wAPlzhIoOKMNHipsgNzlMAVyYZgEJr2CMANikoAKIozOthyJyyQBKLqThwA9P5wgJYMgIYMgJEMgHYMgOsMgLcMgIsMgGMMgMUMgDIMgBragBTqgJoMgNEMgNIMgGBK+eGAVgyAIgy+cGjOEFZIAHRWEJIODMysDXwCnnoyQA)

```tsx
// ❌ 判別子がない場合
type Response = { data: string } | { error: string };

function display(response: Response) {
  // どちらのプロパティが存在するか分からない
  console.log(response.data); // ❌ エラー！
}
```

判別子を使えば、TypeScript が型を正しく絞り込めます。

```tsx
// ✅ 判別子がある場合
type Response =
  | { success: true; data: string }
  | { success: false; error: string };

function display(response: Response) {
  if (response.success) {
    console.log(response.data); // ✅ OK
  } else {
    console.log(response.error); // ✅ OK
  }
}
```

## React での実践例

### 例 1: API レスポンスの表示

API からのレスポンスは、成功と失敗の両方の可能性があります。判別可能なユニオン型を使えば、型安全に処理できます。

```tsx
type SuccessResponse = {
  status: "success";
  data: { id: number; name: string };
};

type ErrorResponse = {
  status: "error";
  message: string;
};

type ApiResponse = SuccessResponse | ErrorResponse;

function ResponseDisplay({ response }: { response: ApiResponse }) {
  if (response.status === "success") {
    // ここでは response は SuccessResponse 型
    return <div>ユーザー名: {response.data.name}</div>;
  }

  // ここでは response は ErrorResponse 型
  return <div>エラー: {response.message}</div>;
}
```

`status` をチェックすることで、TypeScript は自動的に型を絞り込みます。

### 例 2: ローディング状態の管理

データ取得の状態を管理する場合、判別可能なユニオン型が非常に便利です。

```tsx
type User = { id: number; name: string };

type DataState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; error: Error };

function UserProfile({ state }: { state: DataState<User> }) {
  if (state.status === "loading") {
    return <Spinner />;
  }

  if (state.status === "error") {
    // ここでは state.error にアクセス可能
    return <ErrorMessage error={state.error} />;
  }

  if (state.status === "success") {
    // ここでは state.data にアクセス可能
    return <div>{state.data.name}</div>;
  }

  // ここでは state.status は "idle"
  return <div>データを読み込んでいません</div>;
}
```

この例では、`status` の値によって、どのプロパティが存在するかが決まります。TypeScript はこれを理解し、適切な補完とエラーチェックを提供します。

### 例 3: ストリーミングデータの処理

最近では、LLM（大規模言語モデル）API や WebSocket を使ったストリーミング処理が一般的になっています。ストリーミングでは、さまざまな種類のイベントが次々と送られてきます。

#### 問題: any を使った場合

型定義のないストリーミングデータは、扱いが非常に危険です。

[TypeScript Playground で開く](https://www.typescriptlang.org/play/?target=99#code/JYWwDg9gTgLgBAJQKYEMDGMA0cDecCuAzkgMowoxJwC+cAZlBCHAORSoYsBQXA9L3EAy5HBQA7AJ5xASQyB-eUDGDIH0GQI7KgLzTAVgyBo+S4pC40Wnr59MYBFEAqekhhoAFmXYoQwUQHNkhSKOIAKMI3AYAC44QhgoF1cAShCAQV19AHEkUSQoCmgAHjFxAD5cLjg4cWAkABsAE1w4GHEwJBCAIjCUWEbsExAkFvAQgBEKJAA6UQgAdx8omgBuQuLSyura+qa7IwBrdpqkAA9guEbAZQZAZIZAawZAQwZAewZGmbmS8qq8ZYaDirMkLZgIcjKAFQh1ilCCEAIwABlu1B4dCMGFMojgDlQzjcAGFbBRJgUimgzGE4ABtXGiSgk7DEGCosykmAAXTgAF4CMQyINMmEIm5cj5Go0orM5sT8RjRBUyqRwsjGSIEgYsQz8jg5kU6NARGMUMB4D4hfAkAA3FLwCB0Kw2eySpyRDxeXxHM5XPlTJVFV1wfhCOC-OqkNARMDwS6ACoZAJcMgB+GKSAHEtAF+KgHMGQCyDGpACIMytdwFNPgNRqGz0ZDKZjTWok2ztTbopVJJRszhpJOb2-PdAmWEBClD2cFjlzUgHkGGp7Ms0Hhuooe4SADW1ABTqgHUGZOAdYZALcMgEWGQBjDIBihlOgCKGQD1DIBuhkAnQzTwBmDIAghlDYdOakAkQzJwfpuA17O5-MFt6pPnYkc4vEQcVDMoQK4j51l8gKiFSRgwI2HpfD8-xgYQcCAHYMNR1BAg5QoOY5wFOs5Jqh9TSIAgwyAOUMgDDDNux5nuGl43imX73sBMA5j6eYFri4DipQH4ul+TYHBxYBcR8cCABYMSaAGIMgAlDIAmwyAM8MgATDJcuG3nxcBCr+wwAUBjSADHagBhcnysxflCbqmbcczsDA+BQAimQVMA+q5DgxI0tQmS8A5TmzNQQA)

```tsx
// ❌ any を使った危険な例
async function* fetchStreamingResponse(prompt: string): AsyncGenerator<any> {
  yield { type: "start", timestamp: Date.now() };
  yield { type: "chunk", text: "こんにちは" };
  yield { type: "done", totalTokens: 10 };
}

function StreamingChat() {
  const [content, setContent] = useState<string>("");

  const handleStream = async () => {
    for await (const event of fetchStreamingResponse("こんにちは")) {
      // ❌ TypeScript はエラーを検出できない
      if (event.type === "chunk") {
        setContent(event.txt); // typo: text ではなく txt
      }

      // ❌ 存在しないプロパティにアクセスしてもエラーにならない
      if (event.type === "done") {
        console.log(event.tokenCount); // totalTokens の typo
      }

      // ❌ 存在しない type をチェックしてもエラーにならない
      if (event.type === "complete") {
        // "complete" というイベントは存在しない
        console.log("完了");
      }
    }
  };

  return <div>{content}</div>;
}
```

この例の問題点:

- **プロパティ名の typo を検出できない**（`text` → `txt`、`totalTokens` → `tokenCount`）
- **存在しないイベント型を書いてもエラーにならない**（`"complete"`）
- **IDE の補完が効かない**（どんなプロパティがあるか分からない）
- **実行時エラーになって初めて気づく**

#### 解決策: 判別可能なユニオン型を使う

判別可能なユニオン型を使えば、すべてのイベントを型安全に処理できます。

```tsx
// ✅ 型安全なストリーミングイベント定義
type StreamStart = {
  type: "start";
  timestamp: number;
};

type StreamChunk = {
  type: "chunk";
  text: string;
};

type StreamDone = {
  type: "done";
  totalTokens: number;
};

type StreamError = {
  type: "error";
  message: string;
};

type StreamEvent = StreamStart | StreamChunk | StreamDone | StreamError;

// 擬似的なストリーミング関数（async generator を使用）
async function* fetchStreamingResponse(
  prompt: string
): AsyncGenerator<StreamEvent> {
  yield { type: "start", timestamp: Date.now() };

  try {
    // 実際の API 呼び出しをシミュレート
    const chunks = ["こんにちは", "、", "世界", "！"];

    for (const chunk of chunks) {
      // ネットワーク遅延をシミュレート
      await new Promise((resolve) => setTimeout(resolve, 500));
      yield { type: "chunk", text: chunk };
    }

    yield { type: "done", totalTokens: chunks.length };
  } catch (error) {
    yield { type: "error", message: (error as Error).message };
  }
}

// React コンポーネントでの使用例
function StreamingChat() {
  const [content, setContent] = useState<string>("");
  const [status, setStatus] = useState<string>("待機中");
  const [isStreaming, setIsStreaming] = useState(false);

  const handleStream = async () => {
    setContent("");
    setIsStreaming(true);
    let currentText = "";

    // for await of でストリーミングイベントを処理
    for await (const event of fetchStreamingResponse("こんにちは")) {
      switch (event.type) {
        case "start":
          // ✅ event は StreamStart 型に絞り込まれる
          setStatus(`開始: ${new Date(event.timestamp).toLocaleTimeString()}`);
          break;

        case "chunk":
          // ✅ event は StreamChunk 型に絞り込まれる
          // event.txt と typo すればエラーになる
          currentText += event.text;
          setContent(currentText);
          setStatus("受信中...");
          break;

        case "done":
          // ✅ event は StreamDone 型に絞り込まれる
          // totalTokens が正しく補完される
          setStatus(`完了（${event.totalTokens} トークン）`);
          setIsStreaming(false);
          break;

        case "error":
          // ✅ event は StreamError 型に絞り込まれる
          setStatus(`エラー: ${event.message}`);
          setIsStreaming(false);
          break;

        // default:
        //   // ✅ すべてのケースを処理していれば、ここには到達しない
        //   const _exhaustive: never = event;
      }
    }
  };

  return (
    <div>
      <button onClick={handleStream} disabled={isStreaming}>
        送信
      </button>
      <div>状態: {status}</div>
      <div>{content}</div>
    </div>
  );
}
```

**判別可能なユニオン型による改善:**

- ✅ **プロパティ名の typo を即座に検出**（`event.text` の補完が効く）
- ✅ **存在しないイベント型を書くとエラー**（`"complete"` は許可されない）
- ✅ **各 case 内で正しい型に絞り込まれる**（`event.totalTokens` は `"done"` の時だけ存在）
- ✅ **IDE の補完が完璧に機能**（どのプロパティが使えるか一目瞭然）
- ✅ **実行前にエラーを発見できる**

**実際の使用例:**

- OpenAI API のストリーミングレスポンス
- Anthropic Claude API のストリーミング
- WebSocket のイベント処理
- Server-Sent Events (SSE)

## switch 文との組み合わせ

判別可能なユニオン型は、`switch` 文とも相性が良いです。

```tsx
function UserProfile({ state }: { state: DataState<User> }) {
  switch (state.status) {
    case "idle":
      return <div>データを読み込んでいません</div>;
    case "loading":
      return <Spinner />;
    case "success":
      return <div>{state.data.name}</div>;
    case "error":
      return <ErrorMessage error={state.error} />;
  }
}
```

### 網羅性チェック

TypeScript は、すべてのケースを処理しているかをチェックできます。

```tsx
function getStatusMessage(state: DataState<User>): string {
  switch (state.status) {
    case "idle":
      return "待機中";
    case "loading":
      return "読み込み中";
    case "success":
      return "成功";
    // ❌ "error" のケースがない場合、TypeScript がエラーを出す
  }
}
```

すべてのケースを処理することで、将来新しい状態が追加されたときに、TypeScript がエラーで教えてくれます。

## 判別子の選び方

判別子には、以下のような名前がよく使われます。

- `status`: 状態を表す場合（"success", "error", "loading" など）
- `type`: 種類を表す場合（"button", "link", "submit" など）
- `kind`: 種類を表す場合（`type` の代替）

### リテラル型を使う理由

判別子には、**リテラル型**（特定の文字列や数値）を使います。

```tsx
// ✅ リテラル型を使う
type State = { status: "idle" } | { status: "loading" };

// ❌ string 型を使わない
type State = { status: string };
```

リテラル型を使うことで、TypeScript が正確に型を絞り込めます。

### boolean では判別できない理由

boolean を判別子として使うこともできますが、2 つの型しか区別できません。

```tsx
// ✅ 2つの型なら OK
type Response =
  | { success: true; data: string }
  | { success: false; error: string };

// ❌ 3つ以上の型は区別できない
type State =
  | { loading: true }
  | { loading: false; data: string }
  | { loading: false; error: string }; // loading: false が重複
```

3 つ以上の状態を扱う場合は、リテラル型を使いましょう。

## まとめ

判別可能なユニオン型は、複雑な状態を型安全に扱うための強力なパターンです。

- **判別子** となるプロパティを使って、型を自動的に絞り込める
- React の状態管理や API レスポンス処理に最適
- `if` 文や `switch` 文と組み合わせて使う
- 判別子にはリテラル型を使う
- すべてのケースを処理することで、将来の変更に強くなる

判別可能なユニオン型を使うことで、バグを減らし、IDE の補完を最大限に活用できます。
