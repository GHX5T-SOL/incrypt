import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  Dimensions, 
  TouchableOpacity, 
  Animated,
  ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, useTheme } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { neonStyles, theme } from '../theme';
import NeonButton from '../components/NeonButton';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Welcome to Incrypt',
    subtitle: 'Your Mobile DeFi Hub',
    description: 'The ultimate mobile platform for Meteora liquidity farming and DeFi lending on Solana. Experience seamless trading with advanced yield strategies.',
    image: require('../../assets/logo-primary.png'), // Replace with your actual logo
    color: theme.colors.primary,
  },
  {
    id: '2',
    title: 'Liquidity Pools',
    subtitle: 'Meteora Integration',
    description: 'Browse, create, and join Meteora DLMM and DAMM V2 pools with just a few taps. Earn fees and rewards from your crypto assets with real-time analytics.',
    image: require('../../assets/logo-primary.png'), // Replace with your actual image
    color: theme.colors.secondary,
  },
  {
    id: '3',
    title: 'DeFi Lending',
    subtitle: 'Kamino & MarginFi',
    description: 'Lend your assets or borrow against your positions to maximize your yield strategies. Access Kamino vaults and MarginFi markets for optimal returns.',
    image: require('../../assets/logo-primary.png'), // Replace with your actual image
    color: theme.colors.accent,
  },
  {
    id: '4',
    title: 'Advanced Strategies',
    subtitle: 'Smart Yield Optimization',
    description: 'Leverage your positions up to 5x, auto-compound your rewards, and optimize your yield with our intelligent strategy recommendations.',
    image: require('../../assets/logo-primary.png'), // Replace with your actual image
    color: theme.colors.neonBlue,
  },
];

const OnboardingScreen = ({ onDone }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);
  const navigation = useNavigation();
  const theme = useTheme();

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems && viewableItems.length > 0 && viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index || 0);
    } else {
      setCurrentIndex(0);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollTo({
        x: width * (currentIndex + 1),
        animated: true,
      });
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = () => {
    if (onDone) {
      onDone();
    }
    navigation.navigate('ConnectWallet');
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.slidesContainer}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          bounces={false}
          ref={slidesRef}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onMomentumScrollEnd={viewableItemsChanged}
          scrollEventThrottle={32}
          viewabilityConfig={viewConfig}
        >
          {slides.map((slide, index) => (
            <View style={styles.slide} key={slide.id}>
              <View style={[styles.imageContainer, neonStyles.neonContainer]}>
                <Image source={slide.image} style={styles.image} />
              </View>
              
              <View style={styles.textContainer}>
                <Text style={[styles.title, { color: slide.color }]}>
                  {slide.title}
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
                  {slide.subtitle}
                </Text>
                <Text style={styles.description}>
                  {slide.description}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      <View style={styles.bottomContainer}>
        <View style={styles.paginationContainer}>
          {slides.map((_, index) => {
            const inputRange = [
              (index - 1) * width,
              index * width,
              (index + 1) * width,
            ];

            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [8, 20, 8],
              extrapolate: 'clamp',
            });

            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.paginationDot,
                  { width: dotWidth, opacity },
                  { backgroundColor: slides[index].color },
                ]}
              />
            );
          })}
        </View>

        <View style={styles.buttonContainer}>
          {currentIndex < slides.length - 1 ? (
            <NeonButton
              title="Next"
              onPress={scrollTo}
              variant="primary"
              style={styles.nextButton}
            />
          ) : (
            <NeonButton
              title="Get Started"
              onPress={handleGetStarted}
              variant="primary"
              style={styles.getStartedButton}
            />
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  slidesContainer: {
    flex: 1,
  },
  slide: {
    width,
    height: height * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  imageContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    backgroundColor: theme.colors.surface,
  },
  image: {
    width: 120,
    height: 120,
    resizeMode: 'contain',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: theme.colors.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: theme.colors.textSecondary,
  },
  bottomContainer: {
    height: height * 0.2,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  paginationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paginationDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  nextButton: {
    width: 200,
  },
  getStartedButton: {
    width: 200,
  },
});

export default OnboardingScreen;