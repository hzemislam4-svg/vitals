import { HStack, Image, Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

export type CalorieWidgetProps = {
  calories: number;
  goal: number;
  protein: number;
  carbs: number;
  fat: number;
};

function CalorieWidget(props: CalorieWidgetProps, environment: WidgetEnvironment) {
  'widget';
  const { calories, goal, protein, carbs, fat } = props;
  const pct = goal > 0 ? Math.round((calories / goal) * 100) : 0;
  const accent = environment.colorScheme === 'dark' ? '#7DD956' : '#2E8B3D';
  const dim = environment.colorScheme === 'dark' ? '#8A94A6' : '#5A6470';
  const text = environment.colorScheme === 'dark' ? '#F4F7FB' : '#0A0D12';

  const ring = (
    <VStack>
      <Text modifiers={[font({ weight: 'heavy', size: 34 }), foregroundStyle(text)]}>
        {Math.round(calories)}
      </Text>
      <Text modifiers={[font({ size: 12 }), foregroundStyle(dim)]}>of {Math.round(goal)} kcal</Text>
      <Text modifiers={[font({ size: 12, weight: 'semibold' }), foregroundStyle(accent)]}>
        {pct}% of goal
      </Text>
    </VStack>
  );

  const macros = (
    <VStack>
      <MacroRow color="#5AB8FF" label="Protein" value={Math.round(protein)} />
      <MacroRow color="#F5B04C" label="Carbs" value={Math.round(carbs)} />
      <MacroRow color="#FF7A92" label="Fat" value={Math.round(fat)} />
    </VStack>
  );

  if (environment.widgetFamily === 'systemMedium') {
    return (
      <HStack>
        {ring}
        <VStack>{macros}</VStack>
      </HStack>
    );
  }
  return ring;
}

function MacroRow({ color, label, value }: { color: string; label: string; value: number }) {
  'widget';
  return (
    <HStack>
      <Image systemName="circle.fill" color={color} />
      <Text>{label}</Text>
      <Text>{value}g</Text>
    </HStack>
  );
}

export default createWidget('CalorieWidget', CalorieWidget);
