import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: '型から学ぶ',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    description: (
      <>
        TypeScriptの型システムを基礎から学び、型安全なReactコンポーネントの
        書き方を習得できます。型の理解が深まることで、バグの少ないコードが書けるようになります。
      </>
    ),
  },
  {
    title: '実践的な例',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    description: (
      <>
        実際のReact開発で使う<code>Props</code>、<code>State</code>、
        <code>Hooks</code>の型定義を実例とともに解説。
        すぐに使える知識が身につきます。
      </>
    ),
  },
  {
    title: '初学者向け',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    description: (
      <>
        TypeScriptやReactが初めての方でも、段階的に学習できる構成。
        基本的な型から高度な型まで、一歩ずつ理解を深められます。
      </>
    ),
  },
];

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
