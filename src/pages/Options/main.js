import React, { useContext } from 'react';
import { View, TouchableOpacity } from 'react-native';
import { List, Avatar } from 'react-native-paper';
import styled from 'styled-components';

import { Container } from './styles';

import AuthContext from '../../context/AuthContext';

const Text = styled.Text`
  font-family: Inter Regular;
`;

function getFirstLetters (str) {
  if (!str) {
    return 'AB'
  }

  let words = str.trim().split(' ').length;

  if (words > 1) {
    let matches = str.match(/\b(\w)/g);
    return matches.slice(0, 2).join('').toUpperCase();
  } else {
    return str.slice(0, 2).toUpperCase();
  }
}

const Options = ({ navigation }) => {
  const { setUserStatus, user } = useContext(AuthContext);

  return (
    <Container>
      <View style={{ marginTop: 40, backgroundColor: 'white', margin: 15, borderRadius: 10, padding: 20, flexDirection: 'row', alignItems: 'center' }}>
        {
          user.image ? (
            <Avatar.Image source={{ uri: user.image }} />
          ) : (
            <Avatar.Text size={60} label={getFirstLetters(user.name)} />
          )
        }
        <TouchableOpacity onPress={() => navigation.navigate('Profile')} style={{ marginLeft: 25 }}>
          <Text style={{
            fontSize: 18  
          }}>
            { user.name }
          </Text>
          <Text style={{ color: 'grey' }}>Editar perfil</Text>
        </TouchableOpacity>
      </View>

      <View style={{ backgroundColor: 'white', margin: 15, borderRadius: 10 }}>
        <List.Item
          style={{ fontFamily: 'Inter Regular' }}
          title="Gerenciar endereços"
          description="Adicione e remova endereços de entrega"
          onPress={() => navigation.navigate('AndressManager')}
          left={props => (
            <List.Icon {...props} icon="map-marker-outline" />
          )}
        />
        <List.Item
          title="Favoritos"
          description="Meus pratos favoritos"
          onPress={() => navigation.navigate('Favorites')}
          left={props => (
            <List.Icon {...props} icon="heart-multiple-outline" />
          )}
        />
        <List.Item
          title="Termos de uso"
          description="Política de privacidade"
          onPress={() => navigation.navigate('Agreement')}
          left={props => (
            <List.Icon {...props} icon="file-document-outline" />
          )}
        />

        <List.Item
          title="Sair"
          onPress={() => setUserStatus(false)}
          left={props => (
            <List.Icon {...props} icon="exit-to-app" />
          )}
        />
        <List.Item
          title="Ajuda"
          onPress={() => navigation.navigate('Help')}
          left={props => (
            <List.Icon {...props} icon="information-outline" />
          )}
        />
      </View>
    </Container>
  );
}

export default Options;