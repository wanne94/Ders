# Poboljšanja kartica u mobilnoj aplikaciji

## Problem
Kartice predavanja u dashboard sekciji "Dersovi" nisu se prikazivale kako treba - tri tačke (menu) i status indikatori su bili van kartice.

## Rešenje

### 1. UniversalCard komponenta
- **Poboljšan stil**: Dodani su bolji shadow efekti, border radius i spacing
- **Uklonjen Card.Content wrapper**: Direktno stilizovanje sadržaja kartice
- **Poboljšan padding**: Optimizovan za bolji prikaz sadržaja

### 2. AdminContentManagerScreen
- **Uklonjen wrapper container**: ContentItemCard više ne koristi dodatni container sa padding-om
- **Status indikator**: Prebačen na border-left kartice umesto odvojenog elementa
- **Menu button**: Pozicioniran relativno u odnosu na karticu sa background-om
- **Selection overlay**: Poboljšan prikaz kada je kartica selektovana
- **Uklonjena "Na čekanju" opcija**: Status "pending" se dobija samo pri kreiranju, ne može se ručno postaviti

### 3. Ključne izmene

#### UniversalCard.js
```javascript
// Poboljšan card stil
card: {
  marginBottom: 16,
  marginHorizontal: 8,
  elevation: 6,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
  backgroundColor: colors.background.card,
  borderRadius: 16,
  overflow: 'hidden',
}

// Uklonjen Card.Content wrapper
return (
  <TouchableOpacity onPress={onPress} disabled={!onPress}>
    <Card style={[styles.card, cardStyle]}>
      <View style={styles.cardContent}>
        {/* Sadržaj direktno u View-u */}
      </View>
    </Card>
  </TouchableOpacity>
);
```

#### AdminContentManagerScreen.js
```javascript
// Status kao border-left umesto odvojenog elementa
cardStyle={[
  styles.universalCardStyle,
  isSelected && styles.selectedCardStyle,
  type !== 'users' && { 
    borderLeftWidth: 4, 
    borderLeftColor: getStatusColor(item.status) 
  }
]}

// Uklonjen wrapper container
cardContainer: {
  position: 'relative',
  marginBottom: 8,
}

// Admin menu - samo Odobri i Odbaci opcije
{type !== 'users' && (
  <>
    <TouchableOpacity onPress={() => handleStatusChange('active')}>
      <Text>Odobri</Text>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => handleStatusChange('rejected')}>
      <Text>Odbaci</Text>
    </TouchableOpacity>
  </>
)}
```

## Rezultat
- Kartice se sada prikazuju kompaktno i profesionalno
- Menu button i status su integrisani u karticu
- Bolji vizuelni efekat sa shadow-ima i border radius-om
- Konzistentan prikaz kroz celu aplikaciju
- Admin može samo da odobri ili odbaci predavanja, "Na čekanju" status se postavlja automatski pri kreiranju 