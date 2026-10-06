import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { useDispatch } from 'react-redux';
import { onLogout } from '../../redux/slice/authSlice';
import colors from '../../constants/colors';
import fontFamily from '../../constants/fontFamily';
import { moderateScale, moderateScaleVertical, textScale } from '../../styles/responsiveSize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const COUNTRIES = [
  { id: '1', name: 'Switzerland', flag: '🇨🇭', city: 'Zurich', savings: '45%' },
  { id: '2', name: 'Turkey', flag: '🇹🇷', city: 'Istanbul', savings: '70%' },
  { id: '3', name: 'UAE', flag: '🇦🇪', city: 'Dubai', savings: '50%' },
  { id: '4', name: 'Mexico', flag: '🇲🇽', city: 'Cancun', savings: '65%' },
  { id: '5', name: 'Spain', flag: '🇪🇸', city: 'Barcelona', savings: '55%' },
];

const TREATMENTS = [
  {
    id: '1',
    title: 'All-on-4 / All-on-6 Implants',
    subtitle: 'Full arch restoration with premium titanium screws',
    duration: '3-5 Days',
    price: '$4,200',
    originalPrice: '$16,000',
    icon: 'tooth',
    rating: '4.9 (340+ reviews)',
  },
  {
    id: '2',
    title: 'Hollywood Smile & E-Max Veneers',
    subtitle: 'Custom CAD/CAM handcrafted porcelain veneers',
    duration: '4 Days',
    price: '$2,800',
    originalPrice: '$9,500',
    icon: 'star-outline',
    rating: '5.0 (520+ reviews)',
  },
  {
    id: '3',
    title: 'Laser Teeth Whitening & Hygiene',
    subtitle: 'Philips Zoom 4 medical grade deep shade lift',
    duration: '60 Mins',
    price: '$350',
    originalPrice: '$950',
    icon: 'flash-outline',
    rating: '4.8 (210+ reviews)',
  },
];

const Dashboard = () => {
  const insets = useSafeAreaInsets();
  const dispatch = useDispatch();
  const [selectedCountry, setSelectedCountry] = useState('2'); // Turkey default

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primaryNavy} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSub}>Dental Clinic Proposal Demo</Text>
          <Text style={styles.headerTitle}>Global Smile Network 🦷</Text>
        </View>
        <TouchableOpacity
          onPress={() => dispatch(onLogout())}
          style={styles.logoutButton}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.white} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>JCI & ISO ACCREDITED</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.cyan_20 }]}>
              <Text style={[styles.badgeText, { color: colors.cyanGlow }]}>UP TO 70% SAVINGS</Text>
            </View>
          </View>
          <Text style={styles.heroTitle}>Premium International Dental Care</Text>
          <Text style={styles.heroDesc}>
            VIP concierge packages including 3D CT scan, certified oral surgeons, and luxury hotel transfers.
          </Text>
        </View>

        {/* Country Selector */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select Clinic Destination</Text>
          <Text style={styles.sectionBadge}>5 Countries</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.countryList}
        >
          {COUNTRIES.map((c) => {
            const isSelected = selectedCountry === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => setSelectedCountry(c.id)}
                style={[
                  styles.countryChip,
                  isSelected && styles.countryChipActive,
                ]}
              >
                <Text style={styles.countryFlag}>{c.flag}</Text>
                <Text
                  style={[
                    styles.countryName,
                    isSelected && styles.countryNameActive,
                  ]}
                >
                  {c.name}
                </Text>
                <Text style={styles.countrySavings}>Save {c.savings}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Featured Treatments */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Treatment Packages</Text>
        </View>

        {TREATMENTS.map((item) => (
          <View key={item.id} style={styles.treatmentCard}>
            <View style={styles.treatmentHeader}>
              <View style={styles.treatmentIconBox}>
                <MaterialCommunityIcons name="tooth-outline" size={24} color={colors.primaryCyan} />
              </View>
              <View style={{ flex: 1, marginLeft: moderateScale(12) }}>
                <Text style={styles.treatmentTitle}>{item.title}</Text>
                <Text style={styles.treatmentDuration}>⏱ {item.duration} · {item.rating}</Text>
              </View>
            </View>

            <Text style={styles.treatmentSub}>{item.subtitle}</Text>

            <View style={styles.priceRow}>
              <View>
                <Text style={styles.originalPrice}>US/UK Avg: {item.originalPrice}</Text>
                <Text style={styles.packagePrice}>{item.price} <Text style={styles.packageNote}>all-inclusive</Text></Text>
              </View>
              <TouchableOpacity style={styles.bookButton}>
                <Text style={styles.bookButtonText}>View Proposal</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

// define your styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primaryNavy,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: moderateScale(20),
    paddingVertical: moderateScaleVertical(14),
    borderBottomWidth: 1,
    borderBottomColor: colors.navyLight,
  },
  headerSub: {
    color: colors.primaryCyan,
    fontFamily: fontFamily.medium,
    fontSize: textScale(11),
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  headerTitle: {
    color: colors.white,
    fontFamily: fontFamily.bold,
    fontSize: textScale(18),
    marginTop: 2,
  },
  logoutButton: {
    padding: moderateScale(8),
    borderRadius: moderateScale(8),
    backgroundColor: colors.navyLight,
  },
  scrollContent: {
    padding: moderateScale(16),
    paddingBottom: moderateScaleVertical(30),
  },
  heroCard: {
    backgroundColor: colors.navyLight,
    borderRadius: moderateScale(16),
    padding: moderateScale(18),
    borderWidth: 1,
    borderColor: colors.cyan_20,
    marginBottom: moderateScaleVertical(20),
  },
  badgeRow: {
    flexDirection: 'row',
    gap: moderateScale(8),
    marginBottom: moderateScaleVertical(10),
  },
  badge: {
    backgroundColor: colors.white_10,
    paddingHorizontal: moderateScale(8),
    paddingVertical: moderateScaleVertical(4),
    borderRadius: moderateScale(6),
  },
  badgeText: {
    color: colors.white,
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(9),
    letterSpacing: 0.5,
  },
  heroTitle: {
    color: colors.white,
    fontFamily: fontFamily.bold,
    fontSize: textScale(18),
    marginBottom: moderateScaleVertical(6),
  },
  heroDesc: {
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: textScale(12),
    lineHeight: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: moderateScaleVertical(12),
  },
  sectionTitle: {
    color: colors.white,
    fontFamily: fontFamily.bold,
    fontSize: textScale(15),
  },
  sectionBadge: {
    color: colors.primaryCyan,
    fontFamily: fontFamily.medium,
    fontSize: textScale(12),
  },
  countryList: {
    paddingBottom: moderateScaleVertical(18),
    gap: moderateScale(10),
  },
  countryChip: {
    backgroundColor: colors.navyLight,
    paddingHorizontal: moderateScale(14),
    paddingVertical: moderateScaleVertical(12),
    borderRadius: moderateScale(12),
    alignItems: 'center',
    minWidth: moderateScale(105),
    borderWidth: 1,
    borderColor: 'transparent',
  },
  countryChipActive: {
    borderColor: colors.primaryCyan,
    backgroundColor: colors.countryChipActiveBg,
  },
  countryFlag: {
    fontSize: textScale(22),
    marginBottom: moderateScaleVertical(4),
  },
  countryName: {
    color: colors.white,
    fontFamily: fontFamily.semiBold,
    fontSize: textScale(12),
  },
  countryNameActive: {
    color: colors.primaryCyan,
  },
  countrySavings: {
    color: colors.cyanGlow,
    fontFamily: fontFamily.medium,
    fontSize: textScale(10),
    marginTop: 2,
  },
  treatmentCard: {
    backgroundColor: colors.navyLight,
    borderRadius: moderateScale(14),
    padding: moderateScale(16),
    marginBottom: moderateScaleVertical(14),
    borderWidth: 1,
    borderColor: colors.white_05,
  },
  treatmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  treatmentIconBox: {
    width: moderateScale(42),
    height: moderateScale(42),
    borderRadius: moderateScale(10),
    backgroundColor: colors.cyan_10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  treatmentTitle: {
    color: colors.white,
    fontFamily: fontFamily.bold,
    fontSize: textScale(14),
  },
  treatmentDuration: {
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
    marginTop: 2,
  },
  treatmentSub: {
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: textScale(12),
    marginVertical: moderateScaleVertical(10),
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: moderateScaleVertical(10),
    borderTopWidth: 1,
    borderTopColor: colors.white_08,
  },
  originalPrice: {
    color: colors.textMuted,
    fontSize: textScale(10),
    fontFamily: fontFamily.regular,
    textDecorationLine: 'line-through',
  },
  packagePrice: {
    color: colors.primaryCyan,
    fontFamily: fontFamily.bold,
    fontSize: textScale(16),
  },
  packageNote: {
    color: colors.textMuted,
    fontFamily: fontFamily.regular,
    fontSize: textScale(11),
  },
  bookButton: {
    backgroundColor: colors.primaryCyan,
    paddingHorizontal: moderateScale(16),
    paddingVertical: moderateScaleVertical(8),
    borderRadius: moderateScale(8),
  },
  bookButtonText: {
    color: colors.primaryNavy,
    fontFamily: fontFamily.bold,
    fontSize: textScale(12),
  },
});

export default Dashboard;
