import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Switch } from 'react-native';
import { styles, colors } from '../styles/config.styles';

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
}: ConfigurationScreenProps) => {
  const [newUsername, setNewUsername] = useState(username);
  const [newAppPassword, setNewAppPassword] = useState(appPassword);
  const [newShowReposts, setNewShowReposts] = useState(showReposts);
  const [newReviewInterval, setNewReviewInterval] = useState(reviewInterval);

  useEffect(() => {
    setNewUsername(username);
    setNewAppPassword(appPassword);
    setNewShowReposts(showReposts);
    setNewReviewInterval(reviewInterval);
  }, [username, appPassword, showReposts, reviewInterval]);

  const hasChanges =
    newUsername !== username || newAppPassword !== appPassword || newShowReposts !== showReposts;

  const handleSave = () => {
    if (hasChanges) {
      onSave(newUsername, newAppPassword, newShowReposts, newReviewInterval);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BlueSky Configuration</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Username</Text>
        <TextInput
          style={styles.input}
          value={newUsername}
          onChangeText={setNewUsername}
          placeholder="Enter your BlueSky username"
          autoCapitalize="none"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>App Password</Text>
        <TextInput
          style={styles.input}
          value={newAppPassword}
          onChangeText={setNewAppPassword}
          placeholder="Enter your BlueSky app password"
          secureTextEntry
          autoCapitalize="none"
        />
      </View>

      <View style={styles.toggleContainer}>
        <Text style={styles.label}>Show Reposts</Text>
        <Switch
          value={newShowReposts}
          onValueChange={setNewShowReposts}
          trackColor={{ false: colors.switchTrackOff, true: colors.switchTrackOn }}
          thumbColor={newShowReposts ? colors.primary : colors.switchThumbOff}
        />
      </View>

      <View style={styles.toggleContainer}>
        <Text style={styles.label}>Review posts every</Text>
        <View style={styles.inlineInputContainer}>
          <TextInput
            style={styles.numberInput}
            value={String(newReviewInterval)}
            onChangeText={text => setNewReviewInterval(Number(text.replace(/[^0-9]/g, '')))}
            keyboardType="numeric"
            maxLength={3}
          />
          <Text style={styles.label}>days</Text>
        </View>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[
            styles.button,
            isLoading && styles.buttonDisabled,
            !hasChanges && styles.buttonDisabled,
          ]}
          onPress={handleSave}
          disabled={isLoading || !hasChanges}>
          <Text style={styles.buttonText}>
            {isLoading ? 'Verifying...' : isLoggedIn ? 'Save Changes' : 'Login'}
          </Text>
        </TouchableOpacity>

        {isLoggedIn && onLogout && (
          <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        )}

        {isLoggedIn && (
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel} disabled={isLoading}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        )}

        {isLoggedIn && onReset && (
          <TouchableOpacity style={styles.resetButton} onPress={onReset}>
            <Text style={styles.resetButtonText}>Reset Triaged Posts</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

export default ConfigurationScreen;
