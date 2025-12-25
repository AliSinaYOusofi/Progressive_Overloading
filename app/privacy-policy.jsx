import React from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { ArrowLeft, Shield, Lock, Eye, FileText, Mail } from "lucide-react-native";
import { useRouter } from "expo-router";
import { useThemedColors } from "../hooks/useThemedColors";
import { useTheme } from "../contexts/ThemeContext";

export default function PrivacyPolicyScreen() {
  const colors = useThemedColors();
  const { isDarkMode } = useTheme();
  const router = useRouter();

  const sections = [
    {
      title: "Introduction",
      content: "Progressive Overloading ('we', 'our', or 'us') is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our mobile application."
    },
    {
      title: "Information We Collect",
      content: "We collect the following types of information:\n\n• Account Information: Email address, password (encrypted), and profile details\n• Fitness Data: Exercise sets, weights, reps, goals, and progress tracking\n• Usage Data: App usage patterns and preferences\n• Device Information: Device type and operating system version"
    },
    {
      title: "How We Use Your Information",
      content: "We use your information to:\n\n• Provide and improve our services\n• Track your fitness progress and generate analytics\n• Personalize your experience\n• Send you important updates about the app\n• Ensure app security and prevent fraud"
    },
    {
      title: "Data Storage",
      content: "Your data is securely stored in Supabase, a cloud database service. All data is encrypted in transit and at rest. We implement industry-standard security measures to protect your information."
    },
    {
      title: "Data Sharing",
      content: "We do not sell, trade, or rent your personal information to third parties. Your data is only used to provide and improve our services. We may share anonymized, aggregated data for analytics purposes."
    },
    {
      title: "Your Rights",
      content: "You have the right to:\n\n• Access your personal data\n• Correct inaccurate information\n• Delete your account and all associated data\n• Export your data\n• Opt out of certain data collection\n\nTo exercise these rights, please contact us using the information below."
    },
    {
      title: "Data Retention",
      content: "We retain your data for as long as your account is active or as needed to provide our services. If you delete your account, we will delete your personal data within 30 days, except where we are required to retain it by law."
    },
    {
      title: "Security",
      content: "We implement appropriate technical and organizational measures to protect your data, including encryption, secure authentication, and regular security audits. However, no method of transmission over the internet is 100% secure."
    },
    {
      title: "Children's Privacy",
      content: "Our app is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13."
    },
    {
      title: "Changes to This Policy",
      content: "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the 'Last Updated' date."
    },
    {
      title: "Contact Us",
      content: "If you have any questions about this Privacy Policy or wish to exercise your rights, please contact us at:\n\nEmail: privacy@progressiveoverloading.com\n\nLast Updated: January 2024"
    }
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.background.primary }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background.card, borderBottomColor: colors.border.light }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Shield size={24} color={colors.primary[600]} />
          <Text style={[styles.headerTitle, { color: colors.text.primary }]}>Privacy Policy</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {sections.map((section, index) => (
            <View key={index} style={[styles.section, { marginBottom: index === sections.length - 1 ? 40 : 24 }]}>
              <View style={styles.sectionHeader}>
                {index === 0 && <FileText size={20} color={colors.primary[600]} />}
                {index === 1 && <Eye size={20} color={colors.primary[600]} />}
                {index === 2 && <Lock size={20} color={colors.primary[600]} />}
                {index === 3 && <Shield size={20} color={colors.primary[600]} />}
                {index === 4 && <Eye size={20} color={colors.primary[600]} />}
                {index === 5 && <Lock size={20} color={colors.primary[600]} />}
                {index === 6 && <Shield size={20} color={colors.primary[600]} />}
                {index === 7 && <Lock size={20} color={colors.primary[600]} />}
                {index === 8 && <Shield size={20} color={colors.primary[600]} />}
                {index === 9 && <FileText size={20} color={colors.primary[600]} />}
                {index === 10 && <Mail size={20} color={colors.primary[600]} />}
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                  {section.title}
                </Text>
              </View>
              <Text style={[styles.sectionContent, { color: colors.text.secondary }]}>
                {section.content}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  sectionContent: {
    fontSize: 15,
    lineHeight: 24,
    marginLeft: 32,
  },
});

