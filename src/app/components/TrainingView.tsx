import CategorizedContentView from './CategorizedContentView';

export default function TrainingView() {
  return (
    <CategorizedContentView
      kind="training"
      title="训练"
      storageKey="categorizedTraining"
      addEventName="openAddTrainingItem"
      addButtonText="添加训练内容"
      emptyText="当前类别暂无训练内容，点击底部加号添加。"
      infoText="记录您的训练计划和进度，持续进步。"
      defaultCategories={[
        { id: 'default', name: '默认分类', items: [] },
        { id: 'practice', name: '练习清单', items: [] },
      ]}
    />
  );
}