---
sidebar_position: 6
---

# 基本的な型の絞り込み

ある変数がユニオン（複数の型の組み合わせ）であるとき、どの型の変数であるかによって動作を変えなければいけないことがあります。TypeScript では条件分岐を用いることで **型の絞り込み（Type Narrowing）** を行うことができます。

## なぜ型の絞り込みが必要なのか

以下の例を見てみましょう。

```tsx
// 価格は数値だが、未設定の場合もある
function PriceDisplay({ price }: { price: number | null }) {
  return <span>{price.toLocaleString()}円</span>; // ❌ エラー！
}
```

このコードはエラーになります。なぜなら、`price` が `null` の場合、`toLocaleString()` メソッドは存在しないからです。

TypeScript は「`price` が `number` か `null` のどちらか分からない」状態なので、安全のためにエラーを出します。

型の絞り込みを使えば、この問題を解決できます。

```tsx
function PriceDisplay({ price }: { price: number | null }) {
  if (price === null) {
    return <span>価格未設定</span>;
  }

  // ここでは price は number 型に絞り込まれている
  return <span>{price.toLocaleString()}円</span>; // ✅ OK
}
```

## typeof による型ガード

`typeof` 演算子を使うと、プリミティブ型を判定できます。

### 基本的な使い方

```tsx
function formatPrice(value: string | number) {
  if (typeof value === "string") {
    // ここでは value は string 型
    return Number(value).toLocaleString();
  }

  // ここでは value は number 型
  return value.toLocaleString();
}
```

TypeScript は `typeof` チェックの後、それぞれの分岐で型を自動的に絞り込みます。

### React コンポーネントでの使用

```tsx
// 入力値は文字列または数値の両方に対応
function PriceLabel({ price }: { price: string | number }) {
  if (typeof price === "number") {
    return <span>{price.toLocaleString()}円</span>;
  }

  // ここでは price は string 型
  return <span>{price}円</span>;
}
```

### typeof で判定できる型

- `"string"`: 文字列
- `"number"`: 数値
- `"boolean"`: 真偽値
- `"undefined"`: undefined
- `"object"`: オブジェクト（注意：`null` も `"object"` になります）
- `"function"`: 関数

## null と undefined のチェック

`null` や `undefined` をチェックする場合は、厳密な等価演算子（`===`）を使います。

### 基本的な例

```tsx
function PriceDisplay({ price }: { price: number | null }) {
  if (price === null) {
    return <span>価格未設定</span>;
  }

  // ここでは price は number 型
  return <span>{price.toLocaleString()}円</span>;
}
```

### undefined も含む場合

`null` と `undefined` の両方が含まれる場合は、それぞれチェックします。

```tsx
function ProductCard({ price }: { price: number | null | undefined }) {
  if (price === null) {
    return <span>価格未設定</span>;
  }

  if (price === undefined) {
    return <span>価格情報なし</span>;
  }

  // ここでは price は number 型
  return <span>{price.toLocaleString()}円</span>;
}
```

または、まとめてチェックすることもできます。

```tsx
function ProductCard({ price }: { price: number | null | undefined }) {
  if (price == null) {
    // == は null と undefined の両方にマッチ
    return <span>価格情報なし</span>;
  }

  return <span>{price.toLocaleString()}円</span>;
}
```

:::tip
`==` は通常避けるべきですが、`null` と `undefined` をまとめてチェックする場合は `== null` が便利です。`=== null || === undefined` と同じ意味になります。
:::

## 等価性チェックによる絞り込み

リテラル型（特定の値だけを許可する型）を絞り込むこともできます。

### リテラル型の例

```tsx
type LoadingState = "idle" | "loading" | "loaded";

function LoadingIndicator({ state }: { state: LoadingState }) {
  if (state === "loading") {
    return <Spinner />;
  }

  if (state === "idle") {
    return <p>読み込み前</p>;
  }

  // ここでは state は "loaded" のみ
  return <p>読み込み完了</p>;
}
```

TypeScript は各 `if` 文で型を絞り込み、最後の分岐では `"loaded"` だけが残ることを理解します。

## まとめ

型の絞り込みは、TypeScript で安全なコードを書くための基本的なテクニックです。
型の絞り込みを正しく使うことで、ランタイムエラーを防ぎ、IDE の補完も効くようになります。
