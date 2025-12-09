import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Flame } from 'lucide-react-native';
import { useThemedColors } from '../../hooks/useThemedColors';
import { useTheme } from '../../contexts/ThemeContext';

export default function HomeScreenHeader({ profile, user, currentStreak, setShowStreakModal }) {
  const colors = useThemedColors();
  const { isDarkMode } = useTheme();

  return (
    <View
      style={{
        backgroundColor: isDarkMode ? colors.primary[200] : colors.primary[600],
        paddingTop: 48,
        paddingBottom: 24,
        paddingHorizontal: 24,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <View>
          <Text style={{ color: colors.text.white, fontSize: 18, fontWeight: '500' }}>
            Welcome,
          </Text>
          <Text style={{ color: colors.text.white, fontSize: 24, fontWeight: 'bold' }}>
            {profile?.full_name || user?.email?.split('@')[0] || 'Athlete'}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowStreakModal(true)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: isDarkMode ? colors.primary[400] : colors.primary[500],
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
          }}
          activeOpacity={0.7}
        >
          <Flame size={20} color={colors.text.white} />
          <Text style={{ color: colors.text.white, fontWeight: 'bold', marginLeft: 4 }}>
            {currentStreak}
          </Text>
          <Text style={{ color: colors.primary[100], fontSize: 14, marginLeft: 4 }}>
            day(s) streak
          </Text>
        </TouchableOpacity>
      </View>
      {/* <Text style={{ color: colors.primary[50], fontSize: 16 }}>
        Progressive Overload Tracker
      </Text> */}
    </View>
  );
}

