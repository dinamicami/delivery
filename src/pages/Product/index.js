import React, { useContext, useState } from 'react';
import { View } from 'react-native';
import { Button } from 'react-native-paper';

import Container from './Container';
import OptionList from './OptionList';
import Footer from './Footer';

import BasketContext from '../../context/BasketContext';
import FavoriteContext from '../../context/FavoriteContext';

import { ProductContextProvider } from './context';
import { Title, Subtitle } from './styles';

import ThemeContext from '../../context/ThemeContext';

const Product = ({ navigation, route }) => {
  const { mode, background, main, muted, soft, surface, text } = useContext(ThemeContext);

  const { addFavorite, removeFavorite, verifyFavorite } = useContext(FavoriteContext);
  const { showBasket } = useContext(BasketContext);
  const { product } = route.params;

  const [isFavorite, setIsFavorite] = useState(verifyFavorite(product.productId))

  const handleFavorite = () => {
    if (isFavorite) {
      removeFavorite(product.productId);
      setIsFavorite(false);
    } else {
      addFavorite(product.productId);
      setIsFavorite(true);
    }
  }

  return (
    <ProductContextProvider>
      <Container image={product.image}>

        <View style={{ flexDirection: 'row', marginBottom: 20 }}>
          <Button
            onPress={showBasket}
            style={{
              marginRight: 5,
              flex: 1,
            }}
            labelStyle={{ color: main }}
            mode="outlined"
            // icon="basket"
          >
            ver sacola
          </Button>
          <Button
            onPress={handleFavorite}
            style={{
              marginLeft: 5,
              flex: 1,
              backgroundColor: isFavorite ? main : background,
            }}
            labelStyle={{ color: isFavorite ? text.negate() : main }}
            mode={isFavorite ? "contained" : "outlined"}
            // icon={isFavorite ? "heart" : "heart-outline"}
          >
            favoritos
          </Button>
        </View>
        

        <Title style={{ color: text }} numberOfLines={2}>{ product.name }</Title>
        <Subtitle style={{ color: muted }}>{ product.details }</Subtitle>
        <OptionList options={product.options} />
        <Footer product={product} />

      </Container>
    </ProductContextProvider>
  );
}

export default Product;