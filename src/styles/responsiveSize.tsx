import { Dimensions, Platform, StatusBar } from 'react-native';
const { width, height } = Dimensions.get('window');

const LANDSCAPE = 'landscape';
const PORTRAIT = 'portrait';

const X_WIDTH = 375;
const X_HEIGHT = 812;

const XSMAX_WIDTH = 414;
const XSMAX_HEIGHT = 896;

const guidelineBaseWidth = 375;
const guidelineBaseHeight = 812;

const sliderWidth = width - 20;
const itemWidth = width - 20;

const isIPhoneX = (): boolean =>
    Platform.OS === 'ios' && !Platform.isPad && !Platform.isTV
        ? (width === X_WIDTH && height === X_HEIGHT) ||
        (width === XSMAX_WIDTH && height === XSMAX_HEIGHT)
        : false;

const StatusBarHeight: number = Platform.select({
    ios: isIPhoneX() ? 44 : 44,
    android: 44,
    default: 0,
}) ?? 0;

//Non customised
const StatusBarHeightSecond: number = Platform.select({
    ios: isIPhoneX() ? 44 : 20,
    android: StatusBar.currentHeight ?? 0,
    default: 0,
}) ?? 0;

const scale = (size: number) => (width / guidelineBaseWidth) * size;

const verticalScale = (size: number) => (height / guidelineBaseHeight) * size;

const moderateScale = (size: number, factor: number = 0.5) =>
    size + (scale(size) - size) * factor;

const moderateScaleVertical = (size: number, factor: number = 0.5) =>
    size + (verticalScale(size) - size) * factor;

const textScale = (percent: number) => {
    const screenHeight = Dimensions.get('window').height;
    const ratio =
        Dimensions.get('window').height / Dimensions.get('window').width;
    const deviceHeight = screenHeight * (ratio > 1.8 ? 0.14 : 0.15);

    const heightPercent = (percent * deviceHeight) / 100;
    return Math.round(heightPercent);
};

export {
    scale,
    verticalScale,
    textScale,
    moderateScale,
    moderateScaleVertical,
    width,
    height,
    StatusBarHeight,
    StatusBarHeightSecond,
};