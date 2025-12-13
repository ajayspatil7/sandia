"""
SANDIA Lambda Handler - Static Analysis
Triggered by backend API, processes files from S3, uploads results to S3
"""

import json
import boto3
import os
from datetime import datetime, timezone

# Import the Lambda-compatible analyzer
from lambda_analyzer import ShellScriptAnalyzer

# Initialize AWS clients
s3_client = boto3.client('s3')


def lambda_handler(event, context):
    """
    Lambda handler for SANDIA static analysis
    
    Expected event structure:
    {
        "fileId": "uuid-here",
        "s3Bucket": "sandia-jobs", 
        "s3Key": "uploads/uuid/filename.sh",
        "fileName": "malware.sh",
        "analysisType": "static",
        "resultsBucket": "sandia-analysis-results",
        "timestamp": "2025-09-30T05:00:00Z"
    }
    """
    
    try:
        print(f"[Lambda] Received event: {json.dumps(event)}")
        
        # Extract parameters from event
        file_id = event.get('fileId')
        source_bucket = event.get('s3Bucket')
        s3_key = event.get('s3Key')
        file_name = event.get('fileName')
        results_bucket = event.get('resultsBucket', 'sandia-analysis-results')
        
        # Validate required parameters
        if not all([file_id, source_bucket, s3_key, file_name]):
            raise ValueError("Missing required parameters: fileId, s3Bucket, s3Key, or fileName")
        
        print(f"[Lambda] Processing file: {file_name} (ID: {file_id})")
        print(f"[Lambda] Source: s3://{source_bucket}/{s3_key}")
        
        # Step 1: Download file from S3 to /tmp
        local_path = f"/tmp/{file_name}"
        print(f"[Lambda] Downloading file to {local_path}...")
        
        s3_client.download_file(source_bucket, s3_key, local_path)
        print(f"[Lambda] Download complete. File size: {os.path.getsize(local_path)} bytes")
        
        # Step 2: Run static analysis
        print("[Lambda] Starting static analysis...")
        analyzer = ShellScriptAnalyzer(local_path)
        results = analyzer.analyze()
        print("[Lambda] Analysis complete!")
        
        # Add Lambda execution metadata
        results['lambda_metadata'] = {
            'execution_id': context.request_id,
            'function_name': context.function_name,
            'memory_limit_mb': context.memory_limit_in_mb,
            'analysis_timestamp': datetime.now(timezone.utc).isoformat()
        }
        
        # Step 3: Upload results to S3
        results_key = f"{file_id}.json"
        results_json = json.dumps(results, indent=2)
        
        print(f"[Lambda] Uploading results to s3://{results_bucket}/{results_key}")
        s3_client.put_object(
            Bucket=results_bucket,
            Key=results_key,
            Body=results_json,
            ContentType='application/json',
            Metadata={
                'fileId': file_id,
                'originalFilename': file_name,
                'riskScore': str(results['risk_assessment']['risk_score_percentage']),
                'category': results['risk_assessment']['category']
            }
        )
        print("[Lambda] Results uploaded successfully!")
        
        # Step 4: Cleanup temporary file
        os.remove(local_path)
        print("[Lambda] Temporary file cleaned up")
        
        # Step 5: Return success response
        response = {
            'statusCode': 200,
            'body': json.dumps({
                'success': True,
                'message': 'Analysis completed successfully',
                'fileId': file_id,
                'fileName': file_name,
                'resultsKey': results_key,
                'resultsBucket': results_bucket,
                'riskScore': results['risk_assessment']['risk_score_percentage'],
                'category': results['risk_assessment']['category'],
                'severity': results['risk_assessment']['severity'],
                'threatIndicators': results['risk_assessment']['threat_indicators_found'],
                'analysisTimestamp': results['timestamp']
            })
        }
        
        print(f"[Lambda] Execution successful. Risk Score: {results['risk_assessment']['risk_score_percentage']}%")
        return response
        
    except Exception as e:
        # Log the full error
        print(f"[Lambda] ERROR: {str(e)}")
        
        import traceback
        error_traceback = traceback.format_exc()
        print(f"[Lambda] Traceback:\n{error_traceback}")
        
        # Return error response
        return {
            'statusCode': 500,
            'body': json.dumps({
                'success': False,
                'error': str(e),
                'errorType': type(e).__name__,
                'message': 'Analysis failed - check CloudWatch logs for details'
            })
        }