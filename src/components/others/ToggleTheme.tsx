import { Box, Group, Switch, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { MoonStars, Sun } from 'tabler-icons-react';

type Props = {
  classname?: string;
};

export function ToggleTheme({ classname }: Props) {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const theme = useMantineTheme();

  return (
    <Group className={`flex items-center ${classname}`}>
      <Switch
        className='p-0 mb-3'
        checked={colorScheme === 'dark'}
        onChange={() => toggleColorScheme()}
        size='lg'
        color={theme.colorScheme === 'dark' ? 'gray' : 'dark'}
        onLabel={<Sun size={24} color={theme.colors.yellow[4]} />}
        offLabel={<MoonStars size={24} color={theme.colors.blue[6]} />}
      />
    </Group>
  );
}
