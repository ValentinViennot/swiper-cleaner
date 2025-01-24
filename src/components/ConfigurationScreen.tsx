import { AntDesign } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  BackHandler,
  Linking,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { styles } from '../styles/config.styles';
import { theme } from '../styles/theme';

const { colors } = theme;

const DAYS_OPTIONS = Array.from({ length: 365 }, (_, i) => i + 1);

type ConfigurationScreenProps = {
  username: string;
  appPassword: string;
  showReposts: boolean;
  reviewInterval: number;
  onSave: (
    username: string,
    appPassword: string,
    showReposts: boolean,
    reviewInterval: number,
  ) => void;
  onLogout?: () => void;
  onCancel: () => void;
  isLoading: boolean;
  isLoggedIn: boolean;
  onReset?: () => void;
  hasTriagedPosts?: boolean;
};

const ConfigurationScreen = ({
  username,
  appPassword,
  showReposts,
  reviewInterval,
  onSave,
  onLogout,
  onCancel,
  isLoading,
  isLoggedIn,
  onReset,
  hasTriagedPosts,
}: ConfigurationScreenProps) => {
  const [newUsername, setNewUsername] = useState(username);
  const [newAppPassword, setNewAppPassword] = useState(appPassword);
  const [newShowReposts, setNewShowReposts] = useState(showReposts);
  const [newReviewInterval, setNewReviewInterval] = useState(reviewInterval);

  const usernameInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);

  useEffect(() => {
    setNewUsername(username);
    setNewAppPassword(appPassword);
    setNewShowReposts(showReposts);
    setNewReviewInterval(reviewInterval);
  }, [username, appPassword, showReposts, reviewInterval]);

  useEffect(() => {
    if (!isLoggedIn) {
      setTimeout(() => {
        usernameInputRef.current?.focus();
      }, 100);
    }
  }, [isLoggedIn]);

  const hasChanges =
    newUsername !== username ||
    newAppPassword !== appPassword ||
    newShowReposts !== showReposts ||
    newReviewInterval !== reviewInterval;

  const handleSave = () => {
    if (hasChanges) {
      onSave(newUsername, newAppPassword, newShowReposts, newReviewInterval);
    }
  };

  const handleBack = useCallback(() => {
    if (hasChanges) {
      Alert.alert(
        'Unsaved Changes',
        'You have unsaved changes. Are you sure you want to leave?',
        [
          {
            text: 'Stay',
            style: 'cancel',
          },
          {
            text: 'Discard',
            style: 'destructive',
            onPress: onCancel,
          },
        ],
        { cancelable: true },
      );
      return true; // Prevents default back action
    }
    onCancel();
    return true; // Prevents default back action
  }, [hasChanges, onCancel]);

  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', handleBack);

    return () => subscription.remove();
  }, [handleBack, hasChanges]);

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: onLogout,
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} disabled={isLoading}>
          <AntDesign name="arrowleft" size={24} color={colors.textSecondary} />
          <Text style={styles.backButtonText}>Back</Text>
        </TouchableOpacity>

        {hasChanges && (
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.buttonDisabled]}
            onPress={handleSave}
            disabled={isLoading}>
            <Text style={styles.saveButtonText}>{isLoading ? 'Verifying...' : 'Save Changes'}</Text>
            {!isLoading && <AntDesign name="check" size={18} color={colors.white} />}
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>BlueSky Configuration</Text>

        {isLoggedIn && onReset && hasTriagedPosts && (
          <TouchableOpacity style={styles.resetButton} onPress={onReset}>
            <Text style={styles.resetButtonText}>Reset Triaged Posts</Text>
          </TouchableOpacity>
        )}

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            ref={usernameInputRef}
            style={styles.input}
            value={newUsername}
            onChangeText={setNewUsername}
            placeholder="full handle (eg, alice.bsky.social)"
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => passwordInputRef.current?.focus()}
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password (Settings → App Passwords)</Text>
          <TextInput
            ref={passwordInputRef}
            style={styles.input}
            value={newAppPassword}
            onChangeText={setNewAppPassword}
            placeholder="app-specific-revokable-password"
            placeholderTextColor={colors.textTertiary}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
          />
        </View>

        <View style={styles.settingsGroup}>
          <View style={styles.toggleContainer}>
            <View style={styles.toggleLabel}>
              <Text style={styles.label}>Show Reposts</Text>
              <Text style={styles.helperText}>Include reposted content in your review</Text>
            </View>
            <Switch
              value={newShowReposts}
              onValueChange={setNewShowReposts}
              trackColor={{
                false: colors.switchTrackOff,
                true: colors.primary,
              }}
              thumbColor={colors.white}
            />
          </View>

          <View style={styles.toggleContainer}>
            <View style={styles.toggleLabel}>
              <Text style={styles.label}>Review Interval</Text>
              <Text style={styles.helperText}>Days between content reviews</Text>
            </View>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newReviewInterval}
                onValueChange={itemValue => setNewReviewInterval(itemValue)}
                style={styles.picker}
                itemStyle={styles.pickerItem}>
                {DAYS_OPTIONS.map(days => (
                  <Picker.Item
                    key={days}
                    label={`${days} ${days === 1 ? 'day' : 'days'}`}
                    value={days}
                  />
                ))}
              </Picker>
            </View>
          </View>

          {isLoggedIn && onLogout && (
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => Linking.openURL('https://unstaticlabs.com/privacy/')}>
            <Text style={styles.footerLink}>Privacy</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>•</Text>
          <TouchableOpacity
            onPress={() =>
              Linking.openURL('https://github.com/unstaticlabs/swiper-cleaner/blob/main/LICENSE')
            }>
            <Text style={styles.footerLink}>Open Source (MIT)</Text>
          </TouchableOpacity>
          <Text style={styles.footerDivider}>•</Text>
          <TouchableOpacity
            onPress={() => Linking.openURL('mailto:swipercleaner@unstaticlabs.com')}>
            <Text style={styles.footerLink}>Support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ConfigurationScreen;
