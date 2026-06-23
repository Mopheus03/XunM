import CategorizedContentView from './CategorizedContentView';

export default function InspirationView() {
  return (
    <CategorizedContentView
      kind="inspiration"
      title="灵感"
      storageKey="categorizedInspirations"
      addEventName="openAddInspirationItem"
      addButtonText="添加灵感"
      emptyText="当前类别暂无灵感，点击底部加号添加。"
      infoText="记录您的灵感火花，随时回顾和整理。"
      defaultCategories={[
        { id: 'default', name: '默认分类', items: [] },
        { id: 'ideas', name: '点子', items: [] },
      ]}
    />
  );
}