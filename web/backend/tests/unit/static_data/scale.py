from app.models.scale import (ElasticScaleAdvancedConfigModel, ElasticScaleCheckModel,
                              ElasticScaleNodeInModel, ElasticScaleNodeOutModel)

mock_elastic_scale_check: ElasticScaleCheckModel = {
  "status": "Ready"
}


mock_elastic_scale_node_in: ElasticScaleNodeInModel = {
  "data": 6,
  "master": 3,
  "ml": 1,
  "ingest": 4
}


mock_elastic_scale_advanced_config: ElasticScaleAdvancedConfigModel = {
  "elastic": "apiVersion: elasticsearch.k8s.elastic.co/v1 kind: Elasticsearch metadata:   name: tfplenum spec:"
}


mock_elastic_scale_node_out: ElasticScaleNodeOutModel = {
  "master": 3,
  "data": 6,
  "ml": 1,
  "ingest": 0,
  "max_scale_count_master": 3,
  "max_scale_count_data": 9,
  "max_scale_count_ml": 9,
  "max_scale_count_ingest": 0,
  "server_node_count": 3
}
