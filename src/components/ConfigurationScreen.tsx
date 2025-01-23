import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Switch } from 'react-native';

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
          trackColor={{ false: '#767577', true: '#81b0ff' }}
          thumbColor={newShowReposts ? '#2196F3' : '#f4f3f4'}
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

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonDisabled: {
    backgroundColor: '#cccccc',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  logoutButton: {
    marginTop: 12,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#ff4444',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonGroup: {
    gap: 12,
    marginTop: 20,
  },
  cancelButton: {
    marginTop: 16,
    padding: 8,
  },
  cancelButtonText: {
    color: '#999',
    fontSize: 14,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  inlineInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    width: 50,
    textAlign: 'center',
    fontSize: 16,
  },
  resetButton: {
    marginTop: 12,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#ff9800',
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ConfigurationScreen;
