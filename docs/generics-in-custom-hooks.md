---
sidebar_position: 4
---

# ジェネリクスを使ったカスタムフックの型定義

カスタムフックに型引数（ジェネリクス）を導入することで、柔軟で型安全なフックを作ることができます。

## 前回の値を保持する usePrevious

値が変更されたときに、前回の値と比較したい場面があります。

```tsx
function Counter() {
  const [count, setCount] = React.useState(0);
  const prevCount = usePrevious(count);

  return (
    <div>
      <p>現在のカウント: {count}</p>
      <p>前回のカウント: {prevCount}</p>
      <button onClick={() => setCount(count + 1)}>増やす</button>
    </div>
  );
}
```

このような `usePrevious` フックがあると便利です。実装してみましょう。

### 実装例

```tsx
function usePrevious(value: any) {
  const ref = React.useRef();
  React.useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
```

この実装には以下の問題があります：

- `value` の型が `any` なので、どんな値でも受け付けてしまう
- 戻り値の型も推論されず、型安全性が失われる
- IDE の補完が効かない

```tsx
// 問題の例
const prevCount = usePrevious(42); // prevCount の型は any
const prevName = usePrevious("太郎"); // prevName の型も any

// 型エラーが検出されない
prevCount.toUpperCase(); // 実行時エラー！
```

## 解決: ジェネリクスの導入

型引数を使って、渡された値の型を保持するようにします。

```tsx
function usePrevious<T>(value: T): T | undefined {
  const ref = React.useRef<T>();
  React.useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}
```

### 改善点

1. **型引数 `<T>`**: 任意の型を受け取れる
2. **`value: T`**: 引数の型が保持される
3. **`T | undefined`**: 初回レンダリングでは `undefined` を返す可能性があることを明示
4. **`React.useRef<T>()`**: ref の型も適切に指定

## 使用例

```tsx
// 型が正しく推論される
const prevCount = usePrevious(42); // number | undefined
const prevName = usePrevious("太郎"); // string | undefined

// 型エラーが正しく検出される
prevCount.toUpperCase(); // ❌ エラー: number に toUpperCase はない

// 型ガードで安全に使用
if (typeof prevCount === "number") {
  console.log(prevCount * 2); // ✅ OK
}
```

### オブジェクト型での使用

```tsx
interface User {
  id: number;
  name: string;
}

function UserProfile({ user }: { user: User }) {
  const prevUser = usePrevious(user); // User | undefined

  React.useEffect(() => {
    if (prevUser && prevUser.id !== user.id) {
      console.log(
        `ユーザーが ${prevUser.name} から ${user.name} に変更されました`
      );
    }
  }, [user, prevUser]);

  return <div>{user.name}</div>;
}
```

## まとめ

- `any` を使うと型安全性が失われる
- ジェネリクス `<T>` を使うことで、渡された値の型を保持できる
- 初期値が `undefined` の場合は、戻り値の型を `T | undefined` にする
- 型引数により、IDE の補完や型チェックが正しく機能する
