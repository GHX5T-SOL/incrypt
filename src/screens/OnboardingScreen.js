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
import { neonStyles } from '../theme';

const { width, height } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    title: 'Welcome to Incrypt',
    description: 'Your mobile hub for Meteora liquidity farming and DeFi lending on Solana.',
    image: require('../../assets/onboarding-1.png'), // Replace with your actual image
  },
  {
    id: '2',
    title: 'Liquidity Pools',
    description: 'Browse, create, and join Meteora pools with just a few taps. Earn fees and rewards from your crypto assets.',
    image: require('../../assets/onboarding-2.png'), // Replace with your actual image
  },
  {
    id: '3',
    title: 'DeFi Lending',
    description: 'Lend your assets or borrow against your positions to maximize your yield strategies.',
    image: require('../../assets/onboarding-3.png'), // Replace with your actual image
  },
  {
    id: '4',
    title: 'Advanced Strategies',
    description: 'Leverage your positions, auto-compound your rewards, and optimize your yield with our smart strategies.',
    image: require('../../assets/onboarding-4.png'), // Replace with your actual image
  },
];

const OnboardingScreen = ({ onDone }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef(null);
  const navigation = useNavigation();
  const theme = useTheme();

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    setCurrentIndex(viewableItems[0]?.index || 0);
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
                <Text style={[styles.title, { color: theme.colors.primary }]}>{slide.title}</Text>
                <Text style={styles.description}>{slide.description}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
      
      <View style={styles.bottomContainer}>
        <View style={styles.indicatorContainer}>
          {slides.map((_, index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 20, 10],
              extrapolate: 'clamp',
            });
            
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });
            
            const backgroundColor = scrollX.interpolate({
              inputRange,
              outputRange: [theme.colors.disabled, theme.colors.primary, theme.colors.disabled],
              extrapolate: 'clamp',
            });
            
            return (
              <Animated.View
                key={index}
                style={[
                  styles.indicator,
                  { width: dotWidth, opacity, backgroundColor },
                ]}
              />
            );
          })}
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.skipButton]}
            onPress={handleGetStarted}
          >
            <Text style={[styles.skipText, { color: theme.colors.primary }]}>
              {currentIndex === slides.length - 1 ? 'Get Started' : 'Skip'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.nextButton,
              { backgroundColor: theme.colors.primary },
              neonStyles.neonContainer,
            ]}
            onPress={scrollTo}
          >
            <Text style={styles.nextText}>
              {currentIndex === slides.length - 1 ? 'Start' : 'Next'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  slidesContainer: {
    flex: 3,
  },
  slide: {
    width,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  imageContainer: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 24,
  },
  bottomContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  indicatorContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  indicator: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
  },
  skipButton: {
    padding: 15,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButton: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default OnboardingScreen;