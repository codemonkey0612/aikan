# Redis キャッシング実装

## 概要

このプロジェクトでは、Redisを使用して頻繁にアクセスされるデータをキャッシュし、パフォーマンスを向上させています。

## セットアップ

### 1. Redisのインストール

#### Windows
```bash
# Chocolateyを使用
choco install redis-64

# または、Dockerを使用
docker run -d -p 6379:6379 redis:latest
```

#### macOS
```bash
brew install redis
brew services start redis
```

#### Linux
```bash
sudo apt-get install redis-server
sudo systemctl start redis
```

### 2. 環境変数の設定

`.env`ファイルに以下を追加：

```env
REDIS_URL=redis://localhost:6379
```

### 3. Redis接続の確認

サーバー起動時にRedis接続が確立されます。接続に失敗してもアプリケーションは続行します（フォールバック動作）。

## キャッシュ対象データ

### 1. 施設一覧 (`facilities:list`)
- **TTL**: 1時間 (3600秒)
- **無効化タイミング**: 施設の作成・更新・削除時

### 2. 個別施設 (`facility:{id}`)
- **TTL**: 30分 (1800秒)
- **無効化タイミング**: 該当施設の更新・削除時

### 3. オプションマスター (`options:master`)
- **TTL**: 2時間 (7200秒)
- **無効化タイミング**: オプションマスターの作成・更新・削除時
- **カテゴリ別キャッシュ**: `options:master:{category}`

### 4. シフトテンプレート (`shifts:templates`)
- **TTL**: 1時間 (3600秒)
- **無効化タイミング**: シフトテンプレートの作成・更新・削除時
- **施設別キャッシュ**: `shifts:templates:facility:{facility_id}`

### 5. 給与ルール (`salaries:rules`)
- **TTL**: 2時間 (7200秒)
- **無効化タイミング**: 給与ルールの作成・更新・削除時
- **タイプ別キャッシュ**: `salaries:rules:type:{rule_type}`

## キャッシュユーティリティ

### `getOrSetCache<T>(key, fetchFn, ttl)`
キャッシュから取得を試み、ミスの場合はデータベースから取得してキャッシュに保存します。

```typescript
const facilities = await getOrSetCache(
  CACHE_KEYS.FACILITIES,
  () => FacilityModel.getAllFacilities(),
  FACILITIES_TTL
);
```

### `invalidateCache(key)`
指定されたキーのキャッシュを削除します。

```typescript
await invalidateCache(CACHE_KEYS.FACILITIES);
```

### `deleteCachePattern(pattern)`
パターンに一致するすべてのキャッシュを削除します。

```typescript
await deleteCachePattern("facilities:*");
```

## データベーステーブル

以下のテーブルをデータベースに作成する必要があります：

### option_master
```sql
-- backend/src/migrations/create_option_master_table.sql を実行
```

### shift_templates
```sql
-- backend/src/migrations/create_shift_templates_table.sql を実行
```

### salary_rules
```sql
-- backend/src/migrations/create_salary_rules_table.sql を実行
```

## パフォーマンス向上

- **施設一覧**: データベースクエリの削減により、レスポンス時間が大幅に短縮されます
- **マスターデータ**: オプションマスターや給与ルールなどの参照データは、2時間キャッシュされます
- **自動無効化**: データ更新時に自動的にキャッシュが無効化され、一貫性が保たれます

## トラブルシューティング

### Redis接続エラー
- Redisサーバーが起動しているか確認
- `REDIS_URL`環境変数が正しく設定されているか確認
- ファイアウォールでポート6379が開いているか確認

### キャッシュが更新されない
- キャッシュのTTLを確認
- 無効化処理が正しく実行されているか確認
- Redisのキーを直接確認: `redis-cli KEYS "*"`

