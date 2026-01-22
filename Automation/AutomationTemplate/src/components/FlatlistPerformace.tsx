import React from 'react';
import {FlatList, StyleSheet, View, Text} from 'react-native';
import {TEST_ID_CONSTANTS} from '../Constants';

type ItemProps = {
  title: string;
  index: number;
};

type FlatlistPerformaceType = {
  itemsToRender: number;
};

function FlatlistPerformance({itemsToRender}: FlatlistPerformaceType) {
  const flatlistData = Array.from(Array(itemsToRender).keys()).map(index => ({
    index,
    title: `Item ${index}`,
  }));

  const renderItem = ({item}: {item: ItemProps}) => {
    return <Item title={item.title} index={item.index} key={item.index} />;
  };

  return (
    <View testID={TEST_ID_CONSTANTS.FLATLIST_CONTAINER}>
      <FlatList data={flatlistData} renderItem={renderItem} />
    </View>
  );
}

function Item(props: ItemProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.itemText}>{props.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: 'flex',
    height: 100,
    margin: 10,
    backgroundColor: '#0088a9',
    justifyContent: 'center',
  },
  itemText: {
    textAlign: 'center',
    color: '#ffffff',
    fontWeight: 'bold',
  },
});

export default FlatlistPerformance;
