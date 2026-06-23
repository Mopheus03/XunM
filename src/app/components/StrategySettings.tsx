import CategorizedContentView from './CategorizedContentView';

export default function StrategySettings() {
  return (
    <CategorizedContentView
      kind="strategy"
      title=""
      storageKey="categorizedStrategies"
      addEventName="openAddStrategyDialog"
      addButtonText=""
      emptyText="当前类别暂无策略，点击底部加号添加。"
      defaultCategories={[
        { id: 'default', name: '默认分类', items: [] },
        { id: 'habit', name: '习惯方法', items: [] },
      ]}
    />
  );
}