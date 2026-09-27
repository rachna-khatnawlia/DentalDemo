//import liraries
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../constants/colors';
import { StatusBar } from 'expo-status-bar';

// create a component
const AuthWrapperContainer = ({children}:any) => {
    const insets = useSafeAreaInsets();
    
    return (
        <View style={{...styles.container,paddingTop:insets.top}}>
            {children}
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:colors.white
    },
});

//make this component available to the app
export default AuthWrapperContainer;
