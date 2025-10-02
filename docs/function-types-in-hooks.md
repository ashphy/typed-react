# カスタムフックにおける関数型の定義

カスタムフックで関数を引数として受け取る場合、適切な関数型を定義することで型安全性を保つことができます。

## 遅延評価に対応した usePrevious

前のページで作成した `usePrevious` フックを改良して、`useState` のように遅延評価に対応させてみましょう。

### 遅延評価とは

`useState` は初期値として値だけでなく、関数も受け取ることができます。

```tsx
// 値を直接渡す
const [count, setCount] = React.useState(0);

// 関数を渡す（遅延評価）
const [count, setCount] = React.useState(() => {
  // 初回レンダリング時のみ実行される
  const initialValue = expensiveCalculation();
  return initialValue;
});
```

関数を渡すことで、初回レンダリング時のみ実行され、再レンダリングでは実行されません。これにより、重い計算を初回のみに限定できます。

### 遅延評価に対応した usePrevious の使用例

```tsx
function Counter() {
  const [count, setCount] = React.useState(0);

  // 値を直接渡す
  const prevCount1 = usePrevious(count);

  // 関数を渡す（遅延評価）
  const prevCount2 = usePrevious(() => count * 2);

  return (
    <div>
      <p>現在のカウント: {count}</p>
      <p>前回のカウント: {prevCount1}</p>
      <p>前回のカウント（2倍）: {prevCount2}</p>
      <button onClick={() => setCount(count + 1)}>増やす</button>
    </div>
  );
}
```

### 問題: any を使った実装

値と関数の両方を受け取れるようにした実装を考えます。

```tsx
function usePrevious(value: any) {
  const ref = React.useRef();

  React.useEffect(() => {
    // 関数の場合は実行して値を取得
    const actualValue = typeof value === 'function' ? value() : value;
    ref.current = actualValue;
  }, [value]);

  return ref.current;
}
```

この実装には以下の問題があります：

- `value` の型が `any` なので型安全性が失われる
- 関数を渡した場合の戻り値の型が推論されない
- 関数以外の値を渡した場合の型も不明

```tsx
// 型が推論されない
const prev1 = usePrevious(42); // any
const prev2 = usePrevious(() => "hello"); // any
```

## 解決: 関数型とジェネリクスの組み合わせ

型引数とユニオン型を使って、値または関数を受け取れるようにします。

```tsx
function usePrevious<T>(value: T | (() => T)): T | undefined {
  const ref = React.useRef<T>();

  React.useEffect(() => {
    const actualValue = typeof value === 'function' ? (value as () => T)() : value;
    ref.current = actualValue;
  }, [value]);

  return ref.current;
}
```

### 型定義のポイント

1. **`value: T | (() => T)`**: 型 `T` の値、または `T` を返す関数を受け取る
2. **`(): T | undefined`**: 戻り値は `T` 型または `undefined`
3. **`value as () => T`**: `typeof` でチェック後、関数として型アサーション

### より厳密な実装

`useState` と同じように、関数自体を値として渡したい場合にも対応できるようにします。

```tsx
function usePrevious<T>(value: T | (() => T)): T | undefined {
  const ref = React.useRef<T>();

  React.useEffect(() => {
    // value が関数かどうかを判定
    const actualValue = value instanceof Function ? value() : value;
    ref.current = actualValue;
  }, [value]);

  return ref.current;
}
```

## 使用例

```tsx
// 型が正しく推論される
const prev1 = usePrevious(42); // number | undefined
const prev2 = usePrevious(() => "hello"); // string | undefined

// オブジェクト型でも使える
interface User {
  id: number;
  name: string;
}

const prev3 = usePrevious<User>(() => ({
  id: 1,
  name: "太郎"
})); // User | undefined
```

### 実践的な使用例

```tsx
function UserList() {
  const [users, setUsers] = React.useState<User[]>([]);

  // 前回のユーザーリストを遅延評価で保持
  const prevUsers = usePrevious(() => {
    // 重い計算の例：ユーザーIDのリストを作成
    return users.map(u => u.id);
  }); // number[] | undefined

  React.useEffect(() => {
    if (prevUsers) {
      console.log("前回のユーザーID:", prevUsers);
    }
  }, [users, prevUsers]);

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

## まとめ

- 関数を引数として受け取る場合、`() => T` のように関数型を定義する
- ユニオン型 `T | (() => T)` で、値と関数の両方に対応できる
- `typeof` や `instanceof` で型ガードを行い、適切に処理を分岐する
- 遅延評価により、重い計算を初回のみに限定できる
- ジェネリクスと組み合わせることで、柔軟かつ型安全なフックを実装できる
