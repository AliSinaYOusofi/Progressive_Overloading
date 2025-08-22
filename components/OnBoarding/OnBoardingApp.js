import React, { useState } from "react"
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from "react-native"
import { ChevronLeft, ChevronRight, X } from "lucide-react-native"
import { colors, semanticColors } from "../../constants/ui_colors"

const { width, height } = Dimensions.get("window")

const slides = [
  {
    key: "one",
    title: "Track Your Progress",
    description: "Monitor your fitness journey with detailed analytics and insights",
    image: require("../../assets/onboarding_images/Strength and Focus in Motion.png"), // put your image in assets
  },
  {
    key: "two",
    title: "Set Your Goals",
    description: "Define personalized targets and milestones to keep you motivated",
    image: require("../../assets/onboarding_images/Strength and Focus in Motion.png"),
  },
  {
    key: "three",
    title: "Crush Your Workouts",
    description: "Access guided workouts designed to help you reach your potential",
    image: require("../../assets/onboarding_images/Strength and Focus in Motion.png"),
  },
]

const OnboardingCarousel = ({ onComplete, onSkip }) => {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      if (onComplete) onComplete()
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const handleSkip = () => {
    if (onSkip) onSkip()
  }

  const currentSlide = slides[currentIndex]

  return (
    <View style={styles.container}>
      {/* Skip Button */}
      <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
        <X size={24} color="#4B5563" />
      </TouchableOpacity>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Image Section */}
        <View style={styles.imageContainer}>
          <Image source={currentSlide.image} style={styles.image} />
        </View>

        {/* Text Section */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{currentSlide.title}</Text>
          <Text style={styles.description}>{currentSlide.description}</Text>

          {/* Navigation */}
          <View style={styles.navigation}>
            <TouchableOpacity
              onPress={handlePrev}
              disabled={currentIndex === 0}
              style={[styles.navButton, currentIndex === 0 && { opacity: 0.5 }]}
            >
              <ChevronLeft size={20} color="#6B7280" />
              <Text style={styles.navText}>Previous</Text>
            </TouchableOpacity>

            <View style={styles.dots}>
              {slides.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentIndex && styles.activeDot,
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
              <Text style={styles.nextText}>
                {currentIndex === slides.length - 1 ? "Get Started" : "Next"}
              </Text>
              <ChevronRight size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBarContainer}>
        <Text style={styles.progressText}>{currentIndex + 1}</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentIndex + 1) / slides.length) * 100}%` },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{slides.length}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: "center",
  },
  skipButton: {
    position: "absolute",
    top: 10,
    right: 20,
    backgroundColor: colors.background.card,
    padding: 8,
    borderRadius: 50,
    zIndex: 10,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  imageContainer: {
    width: width * 0.8,
    height: width * 1,
    marginBottom: 30,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    resizeMode: "cover",
  },
  textContainer: {
    alignItems: "center",
    gap: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.text.primary,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: "center",
    paddingHorizontal: 10,
  },
  navigation: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 30,
    width: "100%",
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  navText: {
    marginLeft: 4,
    color: colors.text.secondary,
  },
  dots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 50,
    backgroundColor: colors.neutral[300],
  },
  activeDot: {
    width: 20,
    backgroundColor: colors.primary[600],
  },
  nextButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary[600],
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  nextText: {
    color: colors.text.white,
    fontWeight: "600",
    marginRight: 6,
  },
  progressBarContainer: {
    position: "absolute",
    bottom: 40,
    left: width / 2 - 60,
    flexDirection: "row",
    alignItems: "center",
  },
  progressText: {
    fontSize: 14,
    color: colors.text.secondary,
    marginHorizontal: 6,
  },
  progressBar: {
    width: 60,
    height: 4,
    backgroundColor: colors.neutral[200],
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary[600],
  },
})

export default OnboardingCarousel
