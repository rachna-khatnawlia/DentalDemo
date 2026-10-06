import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../constants/colors';

// create a component
const Profile = () => {
    return (
        <View style={styles.container}>
            <Text>Profile</Text>
        </View>
    );
};

// define your styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.profileBg,
    },
});

//make this component available to the app
export default Profile;
