import { StatusBar } from 'expo-status-bar';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { View, Dimensions, Modal, Image, TouchableOpacity, Modal as NativeModal, ScrollView } from 'react-native';
import { Button, Divider, Menu } from 'react-native-paper';
import { Icon } from 'react-native-elements';

import styled from 'styled-components';

import { Container } from './styles';

import Suggestion from './Suggestion';
import Section from './Section';

import AuthContext from '../../context/AuthContext';
import BasketContext from '../../context/BasketContext';
import * as RootNavigation from '../../RootNavigation';

import { useFetch } from '../../hooks/useFetch';
import { useToken } from '../../hooks/useToken';

import ThemeContext from '../../context/ThemeContext';

const Text = styled.Text`
  font-family: Inter Regular;
`;

const getAndress = (json) => {
  try {
    const { street, number, cep, city, state } = JSON.parse(json);
    return `${street}, ${number} - ${cep} - ${city}-${state}`;
  } catch (e) {
    return 'Nenhum endereço'
  }
}

const Basket = () => {
  const { background, main, muted, soft, surface, text } = useContext(ThemeContext);

  const { products, isBasketVisible, dismissBasket, showBasket, handleSendOrder } = useContext(BasketContext);
  const { user, setUser } = useContext(AuthContext);

  const [categories, setCategories] = useState([]);
  const productsArray = categories.flatMap(item => item.products);

  const [andress, setAndress] = useState({ andress: '', andressId: 0 });
  const [isAndressModal, setIsAndressModal] = useState(false);
  const dismissModal = () => setIsAndressModal(false);

  const [paymentMethod, setPaymentMethod] = useState("Dinheiro");
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [isPaymentMethodModal, setIsPaymentMethodModal] = useState(false);
  const dismissPMModal = () => setIsPaymentMethodModal(false);

  useEffect(() => {
    if (user.andress) {
      if (user.andress[0]?.andress !== null) {
        setAndress(user.andress[0]);
      }
    }
  }, []);

  useEffect(() => {
    useFetch.get('/p/all/' + useToken(), (response) => {
      setCategories(response.categories);
    });

    useFetch.get('/p/paymethods/' + useToken(), (response) => {
      setPaymentMethods(response);
    })
  }, []);

  const finalPricing = useMemo(() => products.reduce((acumulador, item) => {
    acumulador += item.price * item.quantity;

    if (item.options[0]) {
      for (let counter = 0; counter < item.options.length; counter ++) {
        acumulador += item.options[counter].price * item.quantity
      }
    }

    return acumulador;
  }, 0), [JSON.stringify(products)]);

  return (
    <Modal
      visible={isBasketVisible}
      onRequestClose={dismissBasket}
      animationType="slide"
    >
      <NativeModal
        transparent
        animationType="fade"
        visible={isPaymentMethodModal}
        onRequestClose={dismissPMModal}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <TouchableOpacity style={{ flex: 1 }} onPress={dismissPMModal} />
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={{ flex: 1 }} onPress={dismissPMModal} />
            <View style={{ backgroundColor: surface, borderRadius: 8, width: '90%', padding: 20 }}>
              {
                paymentMethods.map(item => {
                  
                  const handleSelect = () => {
                    setPaymentMethod(item);
                    setIsPaymentMethodModal(false)
                  }
                  
                  return (
                    <Menu.Item key={Math.random()} titleStyle={{ color: text }} title={item} onPress={handleSelect} />
                  );
                })
              } 
            </View>
            <TouchableOpacity style={{ flex: 1 }} onPress={dismissPMModal} />
          </View>
          <TouchableOpacity style={{ flex: 1 }} onPress={dismissPMModal} />
        </View>
      </NativeModal>

      <NativeModal 
        transparent
        animationType="fade"
        visible={isAndressModal}
        onRequestClose={dismissModal}  
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.6)' }}>
          <TouchableOpacity style={{ flex: 1 }} onPress={dismissModal} />
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity style={{ flex: 1 }} onPress={dismissModal} />
            <ScrollView
              removeClippedSubviews
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 20 }}
              style={{ maxHeight: 500, backgroundColor: background, borderRadius: 8, width: '90%', paddingBottom: 10 }}
            >
              <Text style={{ color: text, fontSize: 18, marginBottom: 10 }}>Selecionar um endereço</Text>
              {
                user.andress?.map(item => {
                  if (item.andress === null) return <View />
                  const { number, cep, state, city, street, name } = JSON.parse(item.andress);
                  return (
                    <TouchableOpacity
                      onPress={() => {
                        setAndress(item);
                        setIsAndressModal(false);
                      }}
                      key={Math.random()}
                      style={{ marginBottom: 10, padding: 15, borderRadius: 4, backgroundColor: surface }}
                    >
                      <Text numberOfLines={1} style={{ fontSize: 17 }}>{ name }</Text>
                      <Text numberOfLines={1} style={{ fontSize: 13 }}>{ `${street}, ${number} - ${cep} - ${city}-${state}` }</Text>
                      <Text style={{ fontSize: 13, color: muted }}>Selecionar</Text>
                    </TouchableOpacity>
                  );
                })
              }
              <TouchableOpacity
                onPress={() => {
                  dismissBasket();

                  RootNavigation.navigate('AndressSelector', {
                    goBack: (data, onEnd) => {
                      const newAndress = JSON.stringify(data);

                      useFetch.post('/p/u/a/create', { userId: user.userId, andress: newAndress }, (response) => {
                        if (response.code) {
                          alert('Aconteceu algum erro, por favor, tente novamente.');
                          onEnd(false);
                        } 
                    
                        else {
                          const newUserAndressArr = user.andress ? user.andress : [];
                          const justNowCreatedAndress = { andressId: response.id, andress: newAndress };
                          newUserAndressArr.push(justNowCreatedAndress);
          
                          setUser({...user, andress: newUserAndressArr });
                          setAndress(justNowCreatedAndress);
                          setIsAndressModal(false);
                          showBasket();

                          onEnd(true);
                        }
                      })
                    }
                  })
                }}
                style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10, marginBottom: 10, padding: 15, borderRadius: 4, backgroundColor: surface }}
              >
                <Icon name="add" color={muted.hex()} />
                <Text numberOfLines={1} style={{ marginLeft: 10, color: muted, fontSize: 17, fontFamily: 'Inter Medium' }}>Adicionar endereço</Text>
              </TouchableOpacity>
            </ScrollView>
            <TouchableOpacity style={{ flex: 1 }} onPress={dismissModal} />
          </View>
          <TouchableOpacity style={{ flex: 1 }} onPress={dismissModal} />
        </View>
      </NativeModal>

      <Container style={{ backgroundColor: background }}>
        <StatusBar backgroundColor="#fff" style="dark" />
        <View style={{ flexDirection: 'row' }}>
          <Icon name="close" type="material-community" color={muted.hex()} onPress={dismissBasket} />
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginLeft: 10 }}>
            Sua sacola
          </Text>
        </View>
        
        <Divider style={{ marginVertical: 10 }} />

        <View style={{ flex: 1 }}>
          {
            !products[0] ? (
              <Text
                style={{ textAlign: 'center', marginTop: Dimensions.get('window').height / 2 - 50 }}
              >Parece que não há nada aqui ainda</Text>
            ) : (
              <>
                <TouchableOpacity
                  style={{ padding: 10, marginBottom: 15, flexDirection: 'row' }}
                  activeOpacity={0.8}
                  onPress={() => {
                    setIsAndressModal(!isAndressModal)
                  }}
                >
                  <Image
                    source={require('../../../assets/images/map.jpg')}
                    style={{ width: 65, height: 65, borderRadius: 10, resizeMode: 'contain'}}
                  />
                  <View style={{ flex: 1, marginLeft: 12, justifyContent: 'space-between' }}>
                    <Text style={{ fontSize: 17, color: muted }}>Entregar em</Text>
                    <Text numberOfLines={1} style={{ color: text, fontSize: 15, flex: 1 }}>
                      {
                        !andress.andress ? 'Selecione o seu endereço' : getAndress(andress.andress)
                      }
                    </Text>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 13, color: muted }}>ALTERAR </Text>
                      <Icon name="chevron-right" type="material-community" color="#666" size={15} />
                    </View>
                  </View>
                </TouchableOpacity>

                {
                  products.map((product) => {
                    return (
                      <Section product={product} key={Math.random() * Math.random()} />
                    );
                  })
                }

                <View style={{ marginTop: 30 }}>
                  <Suggestion
                    style={{ marginHorizontal: -15 }}
                    array={productsArray}
                  />
                </View> 
        

                
                <View style={{ marginTop: 15, paddingTop: 5 }}>
                  <Text style={{ color: text, fontSize: 12, marginLeft: 8 }}>Forma de pagamento</Text>
                  <TouchableOpacity
                    onPress={() => setIsPaymentMethodModal(true)}
                    style={{
                      marginTop: 4,
                      height: 50,
                      alignItems: 'center',
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      backgroundColor: 'rgba(0,0,0,0.05)',
                      paddingHorizontal: 17,
                      borderRadius: 6
                    }}
                  >
                    <Text style={{ color: text, fontSize: 17 }}>{ paymentMethod }</Text>
                    <Icon name="menu-down" type="material-community" color={text.hex()} />
                  </TouchableOpacity>
                </View>
                
                <Text style={{ color: text, fontSize: 28, marginTop: 15 }}> R$ { finalPricing.toFixed(2).toString().replace('.', ',') }</Text>
                
                <Button
                  onPress={() => handleSendOrder(andress.andressId, paymentMethod)}
                  mode="contained"
                  contentStyle={{ height: 60 }}
                  style={{ backgroundColor: main, marginTop: 20 }}
                  labelStyle={{ color: 'white' }}
                >continuar</Button>
              </>
            )
          }
        </View>

      </Container>        
    </Modal>
  );
}

export default Basket;
