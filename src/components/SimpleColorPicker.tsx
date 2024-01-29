import React from 'react'
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import { colors } from '../constants/colors'

function SimpleColorPicker({handleOnPressColor,handleOnPressUnset,mode}) {
  return (
    <View style={{display: "flex"}}>

    <FlatList
          data={colors}
          horizontal
          renderItem={({item, index, separators}) => (
            <TouchableOpacity
              key={item}
              onPress={() => { handleOnPressColor(item,mode) }}
              style={{...style.colorPickerButton,backgroundColor: item}}
              >
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity
              onPress={() => { handleOnPressUnset() }}
              style={{...style.colorPickerButton,backgroundColor: "#cccccc"}}
              >
        </TouchableOpacity>
    </View>
  )
}

const style = StyleSheet.create({
  colorPickerButton:{
    width: 20,
    height: 20
  }
})
export default SimpleColorPicker
