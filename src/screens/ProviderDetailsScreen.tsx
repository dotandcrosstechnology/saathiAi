import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { ArrowLeft, Star, MapPin, Clock, Shield } from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import { spacing, radius, shadows } from '../theme/spacing';

export default function ProviderDetailsScreen({ navigation, route }: any) {
  const provider = route.params?.provider;
  const name = provider?.name || 'Provider';

  return (
    <SafeAreaView style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
          <ArrowLeft color={colors.textPrimary} size={22} />
        </TouchableOpacity>
        <Text style={s.title}>Provider</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.avatarSection}>
          <View style={s.avatar}>
            <Text style={s.avatarText}>{name[0]}</Text>
          </View>
          <Text style={s.name}>{name}</Text>
          {provider?.verified && (
            <View style={s.verifiedBadge}>
              <Shield color={colors.accent} size={14} />
              <Text style={s.verifiedText}>Verified</Text>
            </View>
          )}
        </View>
        <View style={s.statsRow}>
          <Stat label="Rating" value={provider?.rating?.toFixed(1) || '4.8'} icon={<Star color={colors.warning} size={16}/>} />
          <Stat label="Jobs" value={String(provider?.jobs_completed || 120)} icon={<Clock color={colors.primary} size={16}/>} />
          <Stat label="Area" value={provider?.area || 'G-13'} icon={<MapPin color={colors.primary} size={16}/>} />
        </View>
        <View style={s.card}>
          <Text style={s.sectionTitle}>About</Text>
          <Text style={s.body}>Experienced service provider in {provider?.city || 'Islamabad'}. Rated highly by customers for quality and punctuality.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const Stat = ({label,value,icon}:{label:string;value:string;icon:React.ReactNode}) => (
  <View style={s.stat}>{icon}<Text style={s.statVal}>{value}</Text><Text style={s.statLbl}>{label}</Text></View>
);

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:colors.surface},
  header:{height:44,backgroundColor:colors.background,borderBottomWidth:1,borderBottomColor:colors.border,flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingHorizontal:spacing.md},
  back:{width:40,height:40,justifyContent:'center',alignItems:'center'},
  title:{...typography.h2,color:colors.textPrimary},
  content:{padding:spacing.lg,paddingBottom:spacing.huge},
  avatarSection:{alignItems:'center',paddingVertical:spacing.xxl},
  avatar:{width:80,height:80,borderRadius:40,backgroundColor:colors.primary,justifyContent:'center',alignItems:'center',marginBottom:spacing.md,...shadows.md},
  avatarText:{fontSize:32,fontWeight:'700',color:colors.textInverse},
  name:{...typography.h1,color:colors.textPrimary},
  verifiedBadge:{flexDirection:'row',alignItems:'center',gap:4,marginTop:spacing.sm,backgroundColor:colors.accentLight,paddingHorizontal:spacing.sm,paddingVertical:spacing.xs,borderRadius:radius.full},
  verifiedText:{...typography.caption,color:colors.accent,fontWeight:'600'},
  statsRow:{flexDirection:'row',justifyContent:'space-around',backgroundColor:colors.background,borderRadius:radius.lg,padding:spacing.lg,marginBottom:spacing.lg,borderWidth:1,borderColor:colors.border,...shadows.sm},
  stat:{alignItems:'center',gap:4},
  statVal:{...typography.h3,color:colors.textPrimary},
  statLbl:{...typography.caption,color:colors.textTertiary},
  card:{backgroundColor:colors.background,borderRadius:radius.lg,padding:spacing.lg,borderWidth:1,borderColor:colors.border,...shadows.sm},
  sectionTitle:{...typography.label,color:colors.textTertiary,marginBottom:spacing.sm},
  body:{...typography.body,color:colors.textSecondary,lineHeight:22},
});
