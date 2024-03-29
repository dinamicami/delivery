import React, { useContext, useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StatusBar, View } from 'react-native';
import styled from 'styled-components';

import AuthContext from '../../context/AuthContext';
import ThemeContext from '../../context/ThemeContext';
import { useFetch } from '../../hooks/useFetch';

import BasketSvg from './BasketSvg';
import OrderItem from './OrderItem';
import HistoryItem from './HistoryItem';
import { Divider } from 'react-native-paper';

const Text = styled.Text`
  font-family: Inter Regular;
`;

const Orders = ({ navigation }) => {
  const { background, main, muted, text } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefresh, setIsRefresh] = useState(false);

  const refresh = () => {
    setIsLoading(true);
    setIsRefresh(true);

    useFetch.post('/p/order', {
      userId: user.userId
    }, (response) => {
      setIsLoading(false);
      setIsRefresh(false);
      setOrders(response);
    });
  }

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      useFetch.post('/p/order', {
        userId: user.userId
      }, (response) => {
        setIsLoading(false);
        setIsRefresh(false);
        setOrders(response);
      });
    });
    
    return unsubscribe;
  }, [navigation]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: background, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={main} size="small" />
      </View>
    );
  }

  return (
    <ScrollView
      removeClippedSubviews
      refreshControl={
        <RefreshControl refreshing={isRefresh} onRefresh={refresh} />
      }
      style={{ flex: 1, backgroundColor: background }}
      contentContainerStyle={{
        paddingTop: StatusBar.currentHeight + 15,
        padding: 15,
        paddingBottom: 80,
      }}>
        <StatusBar barStyle="dark-content" />
        <Text style={{ fontSize: 24, fontFamily: 'Inter Bold', color: text }}>Meus pedidos</Text>
        {
          orders[0] ? (
            <View>
              {
                !orders.filter(item => [1, 2, 3].some(status => status === item.status))[0] && orders.filter(item => [0, 4, 5].some(status => status === item.status))[0]
                  ? (
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 50 }}>
                      <BasketSvg width={150} height={150} />
                      <Text style={{ color: text, fontSize: 20 }}>Nenhum pedido</Text>
                      <Text style={{ color: text, marginHorizontal: 15, textAlign: 'center' }}>Explore os produtos e promoções ou peça novamente algo do seu histórico.</Text>
                    </View>
                  ) : <></>

              }

              {
                orders
                  .filter(item => item.status !== 0 && item.status !== 4 && item.status !== 5)
                  .sort((a, b) => parseInt(a.createdAt) > parseInt(b.createdAt) ? -1 : 1)
                  .map(order => <OrderItem refresh={refresh} key={order.identifier} order={order} />)
              }
              
              {
                orders
                  .filter(item => item.status === 0)[0] ? (
                    <View style={{ marginTop: 40, marginBottom: 20 }}>
                      <Divider style={{ transform: [{ translateY: 15 }] }} />
                      <Text style={{ color: muted, backgroundColor: background, paddingHorizontal: 10, fontFamily: 'Inter Medium', alignSelf: 'center', fontSize: 17 }}>Pedidos antigos</Text>
                    </View>
                  ) : <></>
              }

              {
                orders
                  .filter(item => item.status === 0 || item.status === 4 || item.status === 5)
                  .sort((a, b) => parseInt(a.createdAt) > parseInt(b.createdAt) ? -1 : 1)
                  .map(history => <HistoryItem key={history.identifier} order={history} />)
              }
            </View>
            ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 200 }}>
              <BasketSvg />
              <Text style={{ fontSize: 20 }}>Nenhum pedido</Text>
              <Text>Explore os produtos e faça seu primeiro pedido</Text>
            </View>
          )
        }
    </ScrollView>
  );
}

export default Orders;